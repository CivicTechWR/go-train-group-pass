#!/bin/bash
# Tea CLI Helper Script for Gitea Issue Management

REPO="dre/go-transit-group"

# Function to list issues
list_issues() {
    echo "📋 Open Issues:"
    tea issues list --login gitea --repo $REPO --state open
}

# Function to list todos (issues with TODO label or specific pattern)
list_todos() {
    echo "✅ TODO Items:"
    tea issues list --login gitea --repo $REPO --state open | grep -i "todo\|fix\|setup\|missing"
}

# Function to create an issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="${3:-}"

    if [ -z "$title" ]; then
        echo "Usage: create_issue 'Title' 'Body' 'label1,label2'"
        return 1
    fi

    tea issues create --login gitea --repo $REPO --title "$title" --body "$body" --labels "$labels"
}

# Function to close an issue
close_issue() {
    local issue_id="$1"
    tea issues close --login gitea --repo $REPO "$issue_id"
}

# Function to show issue details
show_issue() {
    local issue_id="$1"
    tea issues show --login gitea --repo $REPO "$issue_id"
}

# Function to add comment to issue
comment_issue() {
    local issue_id="$1"
    local comment="$2"
    tea issues comment --login gitea --repo $REPO "$issue_id" "$comment"
}

# Main command dispatcher
case "${1:-list}" in
    list)
        list_issues
        ;;
    todos)
        list_todos
        ;;
    create)
        create_issue "$2" "$3" "$4"
        ;;
    close)
        close_issue "$2"
        ;;
    show)
        show_issue "$2"
        ;;
    comment)
        comment_issue "$2" "$3"
        ;;
    *)
        echo "Usage: $0 {list|todos|create|close|show|comment}"
        echo ""
        echo "Commands:"
        echo "  list              - List all open issues"
        echo "  todos             - List TODO items"
        echo "  create 'title' 'body' 'labels' - Create new issue"
        echo "  close <id>        - Close issue"
        echo "  show <id>         - Show issue details"
        echo "  comment <id> 'text' - Add comment to issue"
        ;;
esac
