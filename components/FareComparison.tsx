'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calculator, ExternalLink } from 'lucide-react';

interface FareComparisonProps {
  className?: string;
}

export function FareComparison({ className }: FareComparisonProps) {
  return (
    <Card className={`border-green-500 bg-green-50 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <DollarSign className="h-5 w-5" />
          How Much Can You Save?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="font-semibold text-red-600">Individual Ticket</h3>
            <div className="bg-white border border-red-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-600">$16.32</div>
              <p className="text-sm text-muted-foreground">Kitchener → Union</p>
              <p className="text-xs text-muted-foreground">One-way only</p>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-green-600">Group Pass (5 people)</h3>
            <div className="bg-white border border-green-200 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-600">$12.00</div>
              <p className="text-sm text-muted-foreground">Per person</p>
              <p className="text-xs text-muted-foreground">Round trip included</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-100 border border-green-300 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-green-800">You save $4.32 per trip!</p>
              <p className="text-sm text-green-700">That's 26% savings</p>
            </div>
            <Badge variant="secondary" className="bg-green-200 text-green-800">
              26% OFF
            </Badge>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">Calculate Your Exact Fare</span>
          </div>
          <p className="text-sm text-blue-700 mb-2">
            Use the official GO Transit calculator to see your individual fare:
          </p>
          <a 
            href="https://www.gotransit.com/en/plan-your-trip" 
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-sm"
          >
            GO Transit Fare Calculator
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
