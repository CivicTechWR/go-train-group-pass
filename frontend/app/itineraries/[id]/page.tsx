'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { ItineraryTravelInfoSchema, ItineraryTravelInfo } from '@/lib/types';

import ItineraryCard from '../ItineraryCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, ShieldCheck, Mail, Phone } from 'lucide-react';

export default function ItineraryDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [data, setData] = useState<ItineraryTravelInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const handleSimulateFormation = async () => {
        if (!params.id) return;
        try {
            setIsSimulating(true);
            await apiPost('/group-formation', { itineraryId: params.id });
            // Refresh data
            const result = await apiGet<ItineraryTravelInfo>(`/itineraries?id=${params.id}`);
            const parsed = ItineraryTravelInfoSchema.parse(result);
            setData(parsed);
        } catch (err) {
            console.error('Failed to simulate group formation:', err);
            // Optional: show error toast or message
        } finally {
            setIsSimulating(false);
        }
    };

    useEffect(() => {
        const fetchDetails = async () => {
            if (!params.id) return;
            try {
                setIsLoading(true);
                const result = await apiGet<ItineraryTravelInfo>(`/itineraries?id=${params.id}`);
                const parsed = ItineraryTravelInfoSchema.parse(result);
                setData(parsed);
            } catch (err) {
                setError('Failed to load itinerary details');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchDetails();
    }, [params.id]);

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading details...</div>;
    if (error || !data) return (
        <div className="container mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <div className="p-8 text-center text-destructive">{error || 'Itinerary not found'}</div>
        </div>
    );

    const isSteward = !!(data.groupsFormed && data.members && data.members.length > 0);

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <h1 className="text-3xl font-bold mb-8">Itinerary Details</h1>

            <div className="mb-8">
                <ItineraryCard tripDetails={data.tripDetails} userCount={data.members?.length || (data.groupsFormed ? 2 : 1)} />
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ShieldCheck className="h-5 w-5" />
                            Group Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {data.groupsFormed ? (
                            <div className="flex flex-col gap-4">
                                <div className={`p-4 rounded-lg border ${isSteward ? 'bg-primary/5 border-primary/20' : 'bg-muted/50 border-muted'}`}>
                                    <p className="font-semibold text-lg mb-1">{isSteward ? "You are the Group Steward" : "You are a Member"}</p>
                                    <p className="text-muted-foreground">
                                        {isSteward
                                            ? "You are responsible for purchasing the group pass and coordinating with members."
                                            : "Your group has been formed! Please coordinate with your steward."}
                                    </p>
                                </div>

                                {!isSteward && data.steward && (
                                    <div className="mt-2">
                                        <h3 className="font-semibold mb-3">Your Steward</h3>
                                        <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
                                            <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                                <ShieldCheck className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{data.steward.name}</p>
                                                <p className="text-sm text-muted-foreground truncate">{data.steward.email}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                {data.steward.email && (
                                                    <Button size="icon" variant="ghost" asChild title="Email Steward">
                                                        <a href={`mailto:${data.steward.email}`}>
                                                            <Mail className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                                {data.steward.phoneNumber && (
                                                    <Button size="icon" variant="ghost" asChild title="Call Steward">
                                                        <a href={`tel:${data.steward.phoneNumber}`}>
                                                            <Phone className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg text-yellow-800 dark:text-yellow-200">
                                <p className="font-semibold flex items-center gap-2">
                                    Pending Group Formation
                                </p>
                                <p className="text-sm mt-1 opacity-90">We are currently matching you with other travelers. You will be notified once a group is formed.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isSteward && data.members && data.members.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <User className="h-5 w-5" />
                                Group Members
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.members.map((member, i) => (
                                    <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4 bg-card hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center shrink-0">
                                                <span className="font-semibold text-muted-foreground">
                                                    {member.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium">{member.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 self-end sm:self-auto">
                                            {member.email && (
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={`mailto:${member.email}`}>
                                                        <Mail className="h-4 w-4 mr-2" />
                                                        Email
                                                    </a>
                                                </Button>
                                            )}
                                            {member.phoneNumber && (
                                                <Button size="sm" variant="outline" asChild>
                                                    <a href={`tel:${member.phoneNumber}`}>
                                                        <Phone className="h-4 w-4 mr-2" />
                                                        Call
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Simulation Card */}
                {!data.groupsFormed && (
                    <Card className="border-dashed border-2">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg font-medium">Simulation</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between gap-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                In reality we will form group a specified time prior to train arrival.
                            </p>
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleSimulateFormation}
                                disabled={isSimulating}
                            >
                                {isSimulating ? 'Simulating...' : 'Simulate Group Formation'}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
