import { IntakeInbox } from "@/components/admin/intake-inbox";
import { listTeamsInbox } from "@/lib/mock-db";

export default function AdminIntakeInboxPage(): React.ReactElement {
  const messages = listTeamsInbox();

  return (
    <section className="card">
      <h2>Teams Intake Inbox</h2>
      <p className="meta">
        Pulls pending Job Cards from Microsoft Teams integration queue. Create Job IDs directly from each
        message and attachment set.
      </p>
      <IntakeInbox messages={messages} />
    </section>
  );
}
