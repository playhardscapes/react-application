import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Eye, 
  Archive,
  ArchiveRestore
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const ClientList = ({ searchTerm = '', showArchivedClients = false }) => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    fetchClients();
  }, [token]);

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch clients');
      }

      const fetchedData = await response.json();
      
      // Extract clients from the response
      const clientsArray = fetchedData.clients || 
                           (Array.isArray(fetchedData) ? fetchedData : []);
      
      setClients(clientsArray);
      
      if (clientsArray.length === 0) {
        toast({
          title: "No Clients",
          description: "No clients found in the database.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Failed to fetch clients', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch clients. Please try again.",
        variant: "destructive"
      });
      setClients([]); // Set to empty array to prevent errors
    }
  };

  useEffect(() => {
    const safeClients = Array.isArray(clients) ? clients : [];
    
    const filtered = safeClients.filter(client => 
      (showArchivedClients || !client.is_archived) && 
      (searchTerm === '' || 
        (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.organization && client.organization.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
    
    setFilteredClients(filtered);
  }, [clients, showArchivedClients, searchTerm]);

  const handleArchiveToggle = async (client) => {
    if (isProcessing || !token) return;
    
    setIsProcessing(true);
    try {
      const endpoint = client.is_archived ? 'unarchive' : 'archive';
      const response = await fetch(`/api/clients/${client.id}/${endpoint}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${endpoint} client`);
      }
      
      toast({
        title: "Success",
        description: `Client "${client.name}" has been ${endpoint}d.`,
        variant: "default"
      });
      
      await fetchClients();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Total Projects</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map(client => (
            <TableRow 
              key={client.id}
              className={client.is_archived ? "bg-gray-50" : ""}
            >
              <TableCell>{client.name || 'N/A'}</TableCell>
              <TableCell>{client.organization || 'N/A'}</TableCell>
              <TableCell>{client.email || 'N/A'}</TableCell>
              <TableCell>{client.phone || 'N/A'}</TableCell>
              <TableCell>{client.total_projects || 0}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  <Button
                    variant={client.is_archived ? "outline" : "destructive"}
                    size="sm"
                    onClick={() => handleArchiveToggle(client)}
                    disabled={isProcessing}
                  >
                    {client.is_archived ? (
                      <>
                        <ArchiveRestore className="h-4 w-4 mr-1" /> Unarchive
                      </>
                    ) : (
                      <>
                        <Archive className="h-4 w-4 mr-1" /> Archive
                      </>
                    )}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredClients.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                {showArchivedClients ? 'No archived clients found' : 'No clients found'}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientList;