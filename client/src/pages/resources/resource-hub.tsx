import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { resourceApi } from '@/services/api'
import { Video, Headphones, Filter, Search } from 'lucide-react'

export default function ResourceHub() {
  const [filters, setFilters] = useState({
    language: '',
    mediaType: '',
    search: '',
  })
  const [youtubeQuery, setYoutubeQuery] = useState('psychological therapy session')

  const { data: resources, isLoading } = useQuery({
    queryKey: ['resources', filters],
    queryFn: () => resourceApi.getResources(filters),
  })

  const { data: youtubeVideos, isLoading: youtubeLoading } = useQuery({
    queryKey: ['youtubeResources', youtubeQuery],
    queryFn: () => resourceApi.searchYouTube({
      q: youtubeQuery,
      maxResults: '12',
      safeSearch: 'strict',
      relevanceLanguage: 'en',
    }),
  })

  const filteredResources = resources?.filter((resource: any) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        resource.title.toLowerCase().includes(searchLower) ||
        resource.description.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Hindi']
  const videoCount = resources?.filter((item: any) => item.media_type === 'video').length || 0
  const audioCount = resources?.filter((item: any) => item.media_type === 'audio').length || 0

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="rounded-2xl border bg-card p-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Learning</p>
        <h1 className="mt-2 text-3xl font-semibold">Resource Hub</h1>
        <p className="mt-2 text-muted-foreground">
          Browse curated wellness materials and trusted YouTube sessions.
        </p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{resources?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{videoCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Audio</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{audioCount}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="curated" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="curated">Curated Resources</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="curated" className="mt-6">
          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search resources..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <select
                    id="language"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={filters.language}
                    onChange={(e) => setFilters({ ...filters, language: e.target.value })}
                  >
                    <option value="">All Languages</option>
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mediaType">Media Type</Label>
                  <select
                    id="mediaType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={filters.mediaType}
                    onChange={(e) => setFilters({ ...filters, mediaType: e.target.value })}
                  >
                    <option value="">All Types</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resources Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading resources...</p>
            </div>
          ) : filteredResources?.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No resources found matching your criteria.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResources?.map((resource: any) => (
                <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    {resource.media_type === 'video' ? (
                      <Video className="h-16 w-16 text-primary" />
                    ) : (
                      <Headphones className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg line-clamp-2">
                        {resource.title}
                      </CardTitle>
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full shrink-0">
                        {resource.media_type}
                      </span>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {resource.language}
                      </span>
                      <Button size="sm" asChild>
                        <a
                          href={resource.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {resource.media_type === 'video' ? 'Watch' : 'Listen'}
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="youtube" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Psychological Sessions on YouTube
              </CardTitle>
              <CardDescription>
                Search and explore psychological session-related videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="youtubeSearch">Search Videos</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="youtubeSearch"
                      placeholder="psychological therapy session"
                      value={youtubeQuery}
                      onChange={(e) => setYoutubeQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full md:w-auto"
                    onClick={() => setYoutubeQuery((prev) => prev.trim() || 'psychological therapy session')}
                  >
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {youtubeLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading YouTube videos...</p>
            </div>
          ) : youtubeVideos?.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No YouTube videos found. Try a different search.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {youtubeVideos?.map((video: any) => (
                <Card key={video.videoId} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-black">
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-white" />
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-2">
                      {video.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {video.description || 'YouTube video'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {video.channelTitle}
                      </span>
                      <Button size="sm" asChild>
                        <a
                          href={`https://www.youtube.com/watch?v=${video.videoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Watch
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <p className="text-sm text-primary">
            💡 <strong>Tip:</strong> Mix curated resources with guided YouTube sessions for a balanced
            learning experience. If a topic is distressing, pause and reach out to a professional.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
