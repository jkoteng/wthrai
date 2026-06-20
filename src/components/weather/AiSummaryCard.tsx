export default function AiSummaryCard({ data }: any) {
    const summary = data?.summary || data?.aiSummary;
  
    return (
      <div style={card}>
        <h3>AI Weather Insight</h3>
  
        {summary ? (
          <p>{summary}</p>
        ) : (
          <p style={{ opacity: 0.6 }}>
            No AI summary available on this FREE plan.
          </p>
        )}
      </div>
    );
  }
  
  const card: React.CSSProperties = {
    background: "white",
    padding: 16,
    borderRadius: 10,
    marginTop: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };