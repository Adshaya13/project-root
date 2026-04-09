import React, { useEffect, useState, useContext } from 'react';
import { Layout } from '@/components/layout/Layout';
import { resourceService } from '@/services/resourceService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusPill } from '@/components/common/StatusPill';
import { LoadingSpinner } from '@/components/common/Spinner';
import { EmptyState } from '@/components/common/EmptyState';
import { Building2, MapPin, Users, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';

export const BrowseResources = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [filters, setFilters] = useState({
    type: 'ALL',
    status: 'ALL',
    search: '',
  });

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, resources]);

  const fetchResources = async () => {
    try {
      const data = await resourceService.getAll();
      setResources(data);
      setFilteredResources(data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...resources];

    if (filters.type !== 'ALL') {
      filtered = filtered.filter((r) => r.type === filters.type);
    }

    if (filters.status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          r.location.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredResources(filtered);
  };

  if (loading) {
    return (
      <Layout pageTitle="Browse Resources">
        <LoadingSpinner />
      </Layout>
    );
  }

  return (
    <Layout pageTitle="Browse Resources">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search resources..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger data-testid="type-filter">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="LECTURE_HALL">Lecture Hall</SelectItem>
                  <SelectItem value="LAB">Lab</SelectItem>
                  <SelectItem value="MEETING_ROOM">Meeting Room</SelectItem>
                  <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger data-testid="status-filter">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-slate-600 flex items-center">
                <span className="font-medium">{filteredResources.length}</span>&nbsp;resources found
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources grid */}
        {filteredResources.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No resources found"
            description="Try adjusting your filters or search query"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card
                key={resource.resource_id}
                className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/resources/${resource.resource_id}`)}
                data-testid={`resource-card-${resource.resource_id}`}
              >
                <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden">
                  {resource.image_url ? (
                    <img src={resource.image_url} alt={resource.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <StatusPill status={resource.status} />
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">{resource.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="inline-block px-2 py-1 bg-slate-100 rounded text-xs font-medium">
                        {resource.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="h-4 w-4" />
                      {resource.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="h-4 w-4" />
                      Capacity: {resource.capacity}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="bg-[#f97316] hover:bg-orange-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/resources/${resource.resource_id}`, { state: { autoOpenBooking: true } });
                      }}
                      disabled={resource.status !== 'ACTIVE'}
                      data-testid={`book-now-btn-${resource.resource_id}`}
                    >
                      Book Now
                    </Button>
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/resources/${resource.resource_id}`);
                      }}
                      data-testid={`view-details-btn-${resource.resource_id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
