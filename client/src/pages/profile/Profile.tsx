import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { userApi } from '@/services/api'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, User, Mail, Shield, Save, Phone, MapPin, Camera } from 'lucide-react'
import { toast } from 'sonner'

const profileSchema = z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone_number: z.string().optional(),
    address: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function Profile() {
    const { user, updateProfile, isLoading } = useAuth()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone_number: '',
            address: '',
        },
    })

    useEffect(() => {
        if (user) {
            form.reset({
                fullName: user.full_name || '',
                email: user.email || '',
                phone_number: user.phone_number || '',
                address: user.address || '',
            })
        }
    }, [user, form])

    async function onSubmit(values: ProfileFormValues) {
        try {
            await updateProfile.mutateAsync({
                full_name: values.fullName,
                phone_number: values.phone_number,
                address: values.address,
            })
            toast.success('Profile updated successfully')
            setIsEditing(false)
        } catch (error: any) {
            toast.error(error.message || 'Failed to update profile')
        }
    }

    async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !user?.id) return

        setUploadingAvatar(true)
        try {
            // Call the backend API for avatar upload
            const response = await userApi.uploadAvatar(file)

            // Update the cache immediately with the updated user data from the response
            if (response.user) {
                queryClient.setQueryData(['user', user.id], response.user)
            } else {
                // Fallback: Invalidate user query if response doesn't contain user data
                queryClient.invalidateQueries({ queryKey: ['user', user.id] })
            }

            toast.success('Avatar updated successfully')
        } catch (error: any) {
            toast.error(error.message || 'Error uploading avatar')
        } finally {
            setUploadingAvatar(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    const initials = user?.full_name
        ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        : user?.email?.[0].toUpperCase()

    return (
        <div className="container max-w-2xl py-6 md:py-10 px-4 md:px-0">
            <div className="mb-8 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                <div className="relative group">
                    <Avatar key={user?.avatar_url} className="h-24 w-24 border-2 border-primary/20 transition-all duration-300 group-hover:border-primary/40">
                        <AvatarImage src={user?.avatar_url} className="object-cover" />
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        title="Upload Avatar"
                    >
                        {uploadingAvatar ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Camera className="h-4 w-4" />
                        )}
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarUpload}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{user?.full_name || 'User Profile'}</h1>
                    <p className="text-muted-foreground capitalize">{user?.role} Account</p>
                </div>
            </div>

            <Card className="overflow-hidden border-primary/10 shadow-md">
                <CardHeader className="bg-muted/30">
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                        Manage your account details and personal information.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-1">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                Full Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="John Doe"
                                                    {...field}
                                                    disabled={!isEditing}
                                                    className={!isEditing ? "bg-muted/50 border-transparent shadow-none" : ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    Email Address
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled
                                                        className="bg-muted/50 border-transparent shadow-none"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="phone_number"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                                    Phone Number
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="+1 234 567 890"
                                                        {...field}
                                                        disabled={!isEditing}
                                                        className={!isEditing ? "bg-muted/50 border-transparent shadow-none" : ""}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                                Address
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="123 Wellness Ave, Mindful City"
                                                    {...field}
                                                    disabled={!isEditing}
                                                    className={!isEditing ? "bg-muted/50 border-transparent shadow-none" : ""}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-muted-foreground" />
                                        Account Role
                                    </FormLabel>
                                    <Input
                                        value={user?.role}
                                        disabled
                                        className="bg-muted/50 border-transparent shadow-none capitalize"
                                    />
                                </FormItem>
                            </div>

                            {!isEditing && (
                                <p className="text-[0.8rem] text-muted-foreground mt-[-1rem]">
                                    Email address and Account Role cannot be changed.
                                </p>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                {isEditing ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditing(false)
                                                form.reset()
                                            }}
                                            disabled={updateProfile.isPending}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={updateProfile.isPending}>
                                            {updateProfile.isPending && (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            )}
                                            <Save className="mr-2 h-4 w-4" />
                                            Save Changes
                                        </Button>
                                    </>
                                ) : (
                                    <Button type="button" onClick={() => setIsEditing(true)}>
                                        Edit Profile
                                    </Button>
                                )}
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            <div className="mt-8 rounded-lg border border-destructive/20 bg-destructive/5 p-6">
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" size="sm">
                    Delete Account
                </Button>
            </div>
        </div>
    )
}
