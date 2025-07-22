import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, UpdateProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Globe, Edit, Save, X, Upload, User as UserIcon, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface ProfilePageProps {
  currentUser: User;
  onSignOut: () => void;
}

export function ProfilePage({ currentUser, onSignOut }: ProfilePageProps) {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const profileUserId = id ? parseInt(id) : currentUser.id;
  const isOwnProfile = profileUserId === currentUser.id;
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateProfile>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");

  // Fetch user profile
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['/api/users', profileUserId],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/users/${profileUserId}`);
      return response.json();
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfile) => {
      const response = await apiRequest("PUT", `/api/users/${profileUserId}/profile`, data);
      return response.json();
    },
    onSuccess: (updatedUser: User) => {
      queryClient.setQueryData(['/api/users', profileUserId], updatedUser);
      setIsEditing(false);
      setEditData({});
      setAvatarFile(null);
      setAvatarPreview("");
      toast({
        title: "สำเร็จ!",
        description: "อัปเดตโปรไฟล์เรียบร้อยแล้ว",
      });
    },
    onError: (error: any) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปเดตโปรไฟล์ได้",
        variant: "destructive",
      });
    },
  });

  // Handle avatar upload
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "ไฟล์ใหญ่เกินไป",
          description: "กรุณาเลือกไฟล์ที่มีขนาดไม่เกิน 5MB",
          variant: "destructive",
        });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
        setEditData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    if (!user) return;
    setIsEditing(true);
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio || "",
      location: user.location || "",
      website: user.website || "",
      dateOfBirth: user.dateOfBirth ? format(new Date(user.dateOfBirth), "yyyy-MM-dd") : "",
    });
  };

  const handleSave = () => {
    updateProfileMutation.mutate(editData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
    setAvatarFile(null);
    setAvatarPreview("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดโปรไฟล์...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">ไม่พบผู้ใช้งาน</h3>
            <p className="text-gray-600 mb-4">ไม่สามารถหาผู้ใช้งานที่คุณต้องการได้</p>
            <Button onClick={() => setLocation("/chat")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปแชท
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return "ไม่ระบุ";
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch {
      return "ไม่ระบุ";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setLocation("/chat")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              กลับไปแชท
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isOwnProfile ? "โปรไฟล์ของฉัน" : `โปรไฟล์ของ ${user.firstName} ${user.lastName}`}
            </h1>
          </div>
          
          {isOwnProfile && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    บันทึก
                  </Button>
                  <Button 
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    ยกเลิก
                  </Button>
                </>
              ) : (
                <Button onClick={handleEdit} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  แก้ไขโปรไฟล์
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage 
                      src={avatarPreview || user.avatar || ""} 
                      alt={`${user.firstName} ${user.lastName}`}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isEditing && (
                    <div className="mt-4">
                      <Label htmlFor="avatar-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
                          <Upload className="h-4 w-4" />
                          เปลี่ยนรูปโปรไฟล์
                        </div>
                      </Label>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
                
                {/* Online Status */}
                <div className="flex items-center gap-2 mt-4">
                  <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user.isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                  </span>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                {/* Name */}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editData.firstName || ""}
                          onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="ชื่อจริง"
                          className="text-xl"
                        />
                        <Input
                          value={editData.lastName || ""}
                          onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="นามสกุล"
                          className="text-xl"
                        />
                      </div>
                    ) : (
                      `${user.firstName} ${user.lastName}`
                    )}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">@{user.username}</p>
                </div>

                {/* Bio */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    เกี่ยวกับฉัน
                  </Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.bio || ""}
                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="เขียนเกี่ยวกับตัวเอง..."
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {user.bio || "ยังไม่ได้เขียนเกี่ยวกับตัวเอง"}
                    </p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">ที่อยู่</Label>
                      {isEditing ? (
                        <Input
                          value={editData.location || ""}
                          onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="ที่อยู่"
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{user.location || "ไม่ระบุ"}</p>
                      )}
                    </div>
                  </div>

                  {/* Website */}
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">เว็บไซต์</Label>
                      {isEditing ? (
                        <Input
                          value={editData.website || ""}
                          onChange={(e) => setEditData(prev => ({ ...prev, website: e.target.value }))}
                          placeholder="https://example.com"
                          className="text-sm"
                        />
                      ) : (
                        user.website ? (
                          <a 
                            href={user.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {user.website}
                          </a>
                        ) : (
                          <p className="text-sm">ไม่ระบุ</p>
                        )
                      )}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">วันเกิด</Label>
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editData.dateOfBirth || ""}
                          onChange={(e) => setEditData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                          className="text-sm"
                        />
                      ) : (
                        <p className="text-sm">{formatDate(user.dateOfBirth)}</p>
                      )}
                    </div>
                  </div>

                  {/* Join Date */}
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-gray-500" />
                    <div className="flex-1">
                      <Label className="text-xs text-gray-500">เข้าร่วมเมื่อ</Label>
                      <p className="text-sm">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Actions for Own Profile */}
        {isOwnProfile && (
          <Card>
            <CardHeader>
              <CardTitle>การตั้งค่าบัญชี</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">ออกจากระบบ</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ออกจากบัญชีปัจจุบันและกลับไปหน้าเข้าสู่ระบบ
                  </p>
                </div>
                <Button onClick={onSignOut} variant="destructive">
                  ออกจากระบบ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}