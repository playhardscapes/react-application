import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  Cloud,
  AlertCircle,
  Plus,
  X
} from 'lucide-react';

// Schedule Form Component
const ScheduleForm = ({ onSave, onCancel, initialData = {} }) => {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    schedule_type: 'planned',
    status: 'pending',
    weather_dependent: false,
    ...initialData
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Schedule Type</label>
          <select
            value={formData.schedule_type}
            onChange={(e) => setFormData({ ...formData, schedule_type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="planned">Planned</option>
            <option value="actual">Actual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="delayed">Delayed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={formData.weather_dependent}
            onChange={(e) => setFormData({ ...formData, weather_dependent: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-sm font-medium">Weather Dependent</span>
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData.id ? 'Update Schedule' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  );
};

// Schedule Calendar View
const ScheduleCalendar = ({ schedules, onScheduleClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add the days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getSchedulesForDay = (date) => {
    if (!date) return [];
    
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return schedules.filter(schedule => {
      const startDate = new Date(schedule.start_date);
      const endDate = new Date(schedule.end_date);
      return startDate <= dayEnd && endDate >= dayStart;
    });
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          >
            Next
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-gray-600">
            {day}
          </div>
        ))}
        
        {days.map((date, index) => (
          <div
            key={index}
            className={`min-h-24 p-1 border rounded ${
              date && date.toDateString() === new Date().toDateString()
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white'
            }`}
          >
            {date && (
              <>
                <div className="text-sm text-gray-600 mb-1">
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {getSchedulesForDay(date).map(schedule => (
                    <div
                      key={schedule.id}
                      onClick={() => onScheduleClick(schedule)}
                      className={`p-1 rounded text-xs cursor-pointer ${
                        schedule.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : schedule.status === 'delayed'
                          ? 'bg-red-100 text-red-800'
                          : schedule.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {schedule.weather_dependent && (
                          <Cloud className="h-3 w-3" />
                        )}
                        <span className="truncate">
                          Project #{schedule.project_id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main ProjectSchedule Component
const ProjectSchedule = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/projects/schedule');
      if (!response.ok) throw new Error('Failed to fetch schedules');
      const data = await response.json();
      setSchedules(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchedule = async (scheduleData) => {
    try {
      const response = await fetch(`/api/projects/${scheduleData.project_id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) throw new Error('Failed to create schedule');

      const newSchedule = await response.json();
      setSchedules([...schedules, newSchedule]);
      setShowScheduleForm(false);
      setError(null);
    } catch (error) {
      console.error('Error creating schedule:', error);
      setError('Failed to create schedule');
    }
  };

  const handleUpdateSchedule = async (scheduleId, scheduleData) => {
    try {
      const response = await fetch(`/api/projects/schedule/${scheduleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleData),
      });

      if (!response.ok) throw new Error('Failed to update schedule');

      const updatedSchedule = await response.json();
      setSchedules(schedules.map(s => 
        s.id === updatedSchedule.id ? updatedSchedule : s
      ));
      setSelectedSchedule(null);
      setError(null);
    } catch (error) {
      console.error('Error updating schedule:', error);
      setError('Failed to update schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      const response = await fetch(`/api/projects/schedule/${scheduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete schedule');

      setSchedules(schedules.filter(s => s.id !== scheduleId));
      setSelectedSchedule(null);
      setError(null);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      setError('Failed to delete schedule');
    }
  };

  const updateScheduleStatus = async (scheduleId, newStatus) => {
    try {
      const response = await fetch(`/api/projects/schedule/${scheduleId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const updatedSchedule = await response.json();
      setSchedules(schedules.map(s => 
        s.id === updatedSchedule.id ? updatedSchedule : s
      ));
      setError(null);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status');
    }
  };

  return (
    <PageContainer>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Project Schedule</h1>
            <p className="text-gray-600">Manage project timelines and schedules</p>
          </div>
          <Dialog open={showScheduleForm} onOpenChange={setShowScheduleForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Schedule</DialogTitle>
                <DialogDescription>
                  Add schedule details below
                </DialogDescription>
              </DialogHeader>
              <ScheduleForm
                onSave={handleCreateSchedule}
                onCancel={() => setShowScheduleForm(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">
                    {schedules.filter(s => s.status === 'in_progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Delayed</p>
                  <p className="text-2xl font-bold">
                    {schedules.filter(s => s.status === 'delayed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Weather Dependent</p>
                    <p className="text-2xl font-bold">
                    {schedules.filter(s => s.weather_dependent).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold">
                    {schedules.filter(s => s.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Schedule Calendar */}
        <Card>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">Loading schedule...</div>
            ) : (
              <ScheduleCalendar 
                schedules={schedules}
                onScheduleClick={schedule => {
                  setSelectedSchedule(schedule);
                  navigate(`/projects/${schedule.project_id}`);
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Schedule Details Dialog */}
        <Dialog 
          open={selectedSchedule !== null} 
          onOpenChange={() => setSelectedSchedule(null)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex justify-between items-center">
                <span>Schedule Details</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSchedule(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            {selectedSchedule && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {new Date(selectedSchedule.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">
                      {new Date(selectedSchedule.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium capitalize">
                      {selectedSchedule.schedule_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Select
                      defaultValue={selectedSchedule.status}
                      onValueChange={(value) => 
                        updateScheduleStatus(selectedSchedule.id, value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Cloud className={`h-4 w-4 ${
                    selectedSchedule.weather_dependent 
                      ? 'text-purple-600' 
                      : 'text-gray-400'
                  }`} />
                  <span className="text-sm">
                    {selectedSchedule.weather_dependent 
                      ? 'Weather Dependent' 
                      : 'Not Weather Dependent'}
                  </span>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                  <Button onClick={() => {
                    navigate(`/projects/${selectedSchedule.project_id}`);
                    setSelectedSchedule(null);
                  }}>
                    View Project
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
     </PageContainer>
  );
};

export default ProjectSchedule;