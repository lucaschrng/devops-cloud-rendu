<script setup>
import { ref, onMounted } from 'vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, UserCheck, MessageCircle, PlusCircle, Eye, ArrowLeft } from 'lucide-vue-next';
import { getUserRoles } from '../utils/auth-utils';
import { useRouter } from 'vue-router';

const router = useRouter();
const userRoles = ref({ isAdmin: false, isUser: false, groups: [] });

const checkUserRoles = async () => {
  try {
    userRoles.value = await getUserRoles();
  } catch (error) {
    console.error('Error checking user roles:', error);
  }
};

onMounted(() => {
  checkUserRoles();
});
</script>

<template>
  <div class="container mx-auto py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <!-- Back button -->
      <Button 
        variant="ghost" 
        class="mb-6 flex items-center gap-2" 
        @click="router.push('/')"
      >
        <ArrowLeft class="h-4 w-4" />
        Back to Home
      </Button>

      <!-- Page Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold mb-4">User Roles & Permissions</h1>
        <p class="text-lg text-muted-foreground">
          Understand what you can do with your current role
        </p>
      </div>

      <!-- Current User Role -->
      <Card class="mb-8">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            Your Current Role
            <Badge 
              v-if="userRoles.isAdmin"
              variant="destructive"
              class="flex items-center gap-1"
            >
              <Shield class="h-3 w-3" />
              Admin
            </Badge>
            <Badge 
              v-else-if="userRoles.isUser"
              variant="secondary"
              class="flex items-center gap-1"
            >
              <UserCheck class="h-3 w-3" />
              User
            </Badge>
            <Badge v-else variant="outline">
              No Role Assigned
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="userRoles.isAdmin" class="text-green-600">
            ✅ You have administrator privileges and can perform all actions.
          </div>
          <div v-else-if="userRoles.isUser" class="text-blue-600">
            ✅ You have user privileges and can comment on products.
          </div>
          <div v-else class="text-amber-600">
            ⚠️ No role assigned. Contact an administrator to get access.
          </div>
        </CardContent>
      </Card>

      <!-- Role Descriptions -->
      <div class="grid md:grid-cols-2 gap-6 mb-8">
        <!-- Admin Role -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Shield class="h-5 w-5 text-red-500" />
              Administrator
            </CardTitle>
            <CardDescription>
              Full access to all features and content management
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <h4 class="font-semibold">Permissions:</h4>
              <ul class="space-y-1 text-sm">
                <li class="flex items-center gap-2">
                  <PlusCircle class="h-4 w-4 text-green-500" />
                  Create new products
                </li>
                <li class="flex items-center gap-2">
                  <Eye class="h-4 w-4 text-blue-500" />
                  View all products
                </li>
                <li class="flex items-center gap-2">
                  <MessageCircle class="h-4 w-4 text-purple-500" />
                  Comment on products
                </li>
                <li class="flex items-center gap-2">
                  <Shield class="h-4 w-4 text-red-500" />
                  Edit and delete products
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <!-- User Role -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <UserCheck class="h-5 w-5 text-blue-500" />
              User
            </CardTitle>
            <CardDescription>
              Standard user with commenting privileges
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <h4 class="font-semibold">Permissions:</h4>
              <ul class="space-y-1 text-sm">
                <li class="flex items-center gap-2">
                  <Eye class="h-4 w-4 text-blue-500" />
                  View all products
                </li>
                <li class="flex items-center gap-2">
                  <MessageCircle class="h-4 w-4 text-purple-500" />
                  Comment on products
                </li>
                <li class="flex items-center gap-2 text-muted-foreground">
                  <PlusCircle class="h-4 w-4" />
                  <span class="line-through">Create products (Admin only)</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- How to Get Roles -->
      <Card>
        <CardHeader>
          <CardTitle>How to Get Access</CardTitle>
          <CardDescription>
            Need different permissions? Here's how to get them
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <h4 class="font-semibold flex items-center gap-2">
                <UserCheck class="h-4 w-4 text-blue-500" />
                To become a User
              </h4>
              <p class="text-sm text-muted-foreground">
                Contact an administrator to be added to the "User" group. 
                This will allow you to comment on products.
              </p>
            </div>
            <div class="space-y-2">
              <h4 class="font-semibold flex items-center gap-2">
                <Shield class="h-4 w-4 text-red-500" />
                To become an Admin
              </h4>
              <p class="text-sm text-muted-foreground">
                Administrator access is granted by existing administrators. 
                This role allows full content management.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Contact Information -->
      <Card class="mt-6">
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            If you need different permissions or have questions about your role, 
            please contact an administrator through your organization's support channels.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
