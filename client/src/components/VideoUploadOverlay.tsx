import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { resourceApi } from '@/services/api'
import { supabase } from '@/services/supabase'
import { PlusCircle, Loader2, Upload, FileVideo } from 'lucide-react'
import { toast } from 'sonner'


const resourceSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    media_url: z.string().optional(),
    language: z.string().min(1, 'Please select a language'),
    media_type: z.enum(['video', 'audio']).default('video'),
}).refine(data => data.media_url || data.media_type === 'video', {
    message: "Media URL is required if no file is uploaded",
    path: ["media_url"]
})


type ResourceFormValues = z.infer<typeof resourceSchema>

export function VideoUploadOverlay() {
    const [open, setOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const queryClient = useQueryClient()


    const form = useForm<ResourceFormValues>({
        resolver: zodResolver(resourceSchema) as any,
        defaultValues: {
            title: '',
            description: '',
            media_url: '',
            language: '',
            media_type: 'video',
        },
    })



    const createResource = useMutation({
        mutationFn: resourceApi.createResource,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminResources'] })
            queryClient.invalidateQueries({ queryKey: ['resources'] })
            toast.success('Resource uploaded successfully')
            setOpen(false)
            form.reset()
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to upload resource')
        },
    })

    async function onSubmit(values: ResourceFormValues) {
        setUploading(true)
        try {
            let mediaUrl = values.media_url || ''

            if (selectedFile) {
                const fileExt = selectedFile.name.split('.').pop()
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
                const filePath = `resources/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('resources')
                    .upload(filePath, selectedFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('resources')
                    .getPublicUrl(filePath)

                mediaUrl = publicUrl
            }

            if (!mediaUrl) {
                toast.error('Please provide a video URL or upload a file')
                return
            }

            createResource.mutate({ ...values, media_url: mediaUrl })
        } catch (error: any) {
            toast.error(error.message || 'Error uploading file')
        } finally {
            setUploading(false)
        }
    }


    const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Hindi']

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add Video Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add Video Resource</DialogTitle>
                    <DialogDescription>
                        Enter the details of the video resource you want to add to the library.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Introduction to Mindfulness" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Briefly describe the content of the video..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="media_url"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between">
                                        <FormLabel>Video Resource</FormLabel>
                                        <span className="text-xs text-muted-foreground italic">URL or Local File</span>
                                    </div>
                                    <FormControl>
                                        <div className="space-y-3">
                                            <Input
                                                placeholder="https://www.youtube.com/watch?v=..."
                                                {...field}
                                                disabled={!!selectedFile}
                                            />

                                            <div className="relative">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full border-dashed"
                                                        onClick={() => document.getElementById('video-upload')?.click()}
                                                        disabled={field.value !== ''}
                                                    >
                                                        {selectedFile ? (
                                                            <><FileVideo className="mr-2 h-4 w-4 text-primary" /> {selectedFile.name}</>
                                                        ) : (
                                                            <><Upload className="mr-2 h-4 w-4" /> Upload from Computer</>
                                                        )}
                                                    </Button>
                                                    {selectedFile && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setSelectedFile(null)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    )}
                                                </div>
                                                <input
                                                    id="video-upload"
                                                    type="file"
                                                    accept="video/*,audio/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0]
                                                        if (file) setSelectedFile(file)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Language</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a language" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {languages.map((lang) => (
                                                <SelectItem key={lang} value={lang}>
                                                    {lang}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                                disabled={createResource.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createResource.isPending || uploading}>
                                {(createResource.isPending || uploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {uploading ? 'Uploading File...' : 'Upload Resource'}
                            </Button>

                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
