const CommunicationsInbox = () => {
    const [communications, setCommunications] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchCommunications = async () => {
        try {
          const response = await fetch('/api/communications/unhandled');
          const data = await response.json();
          setCommunications(data);
        } catch (error) {
          console.error('Failed to fetch communications', error);
        } finally {
          setLoading(false);
        }
      };
  
      // Fetch immediately and then every 5 minutes
      fetchCommunications();
      const intervalId = setInterval(fetchCommunications, 5 * 60 * 1000);
  
      return () => clearInterval(intervalId);
    }, []);
  
    const handleStatusUpdate = async (id, status) => {
      try {
        await fetch(`/api/communications/${id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
  
        // Remove from list or refresh
        setCommunications(prev => 
          prev.filter(comm => comm.id !== id)
        );
      } catch (error) {
        console.error('Failed to update communication', error);
      }
    };
  
    return (
      <div>
        <h2>Unhandled Communications</h2>
        {communications.map(comm => (
          <div key={comm.id}>
            <p>{comm.message_content}</p>
            <button onClick={() => handleStatusUpdate(comm.id, 'resolved')}>
              Mark Handled
            </button>
            <button onClick={() => handleStatusUpdate(comm.id, 'in_progress')}>
              In Progress
            </button>
          </div>
        ))}
      </div>
    );
  };