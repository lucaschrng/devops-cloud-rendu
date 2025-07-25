<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { Menu, X, User, Home, Package, PlusCircle, User2, Shield, UserCheck, Info } from 'lucide-vue-next';
import { getCurrentUser } from 'aws-amplify/auth';
import { useQuery } from '@tanstack/vue-query';
import { getUserRoles, canCreateProducts } from '../../utils/auth-utils';

const router = useRouter();
const isOpen = ref(false);
const isAuthenticated = ref(false);
const userRoles = ref({ isAdmin: false, isUser: false, groups: [] });
const canCreate = ref(false);

const { data: authData, error } = useQuery({
  queryKey: ['auth'],
  queryFn: getCurrentUser,
});

// Computed property for navigation items based on user roles
const navItems = computed(() => {
  const items = [
    { name: 'Home', path: '/', icon: Home, requiresAuth: false },
    { name: 'Products', path: '/products', icon: Package, requiresAuth: false },
  ];
  
  // Only show "Create Product" for admins
  if (canCreate.value) {
    items.push({ name: 'Create Product', path: '/create-product', icon: PlusCircle, requiresAuth: true });
  }
  
  // Add roles info for authenticated users
  if (authData.value && !error.value) {
    items.push({ name: 'Roles Info', path: '/roles', icon: Info, requiresAuth: true });
  }
  
  return items;
});

// Computed property for user role badge
const userRoleBadge = computed(() => {
  if (userRoles.value.isAdmin) {
    return { text: 'Admin', variant: 'destructive', icon: Shield };
  } else if (userRoles.value.isUser) {
    return { text: 'User', variant: 'secondary', icon: UserCheck };
  }
  return null;
});

// Check user roles when component mounts
const checkUserRoles = async () => {
  try {
    if (authData.value && !error.value) {
      userRoles.value = await getUserRoles();
      canCreate.value = await canCreateProducts();
    }
  } catch (err) {
    console.error('Error checking user roles:', err);
  }
};

onMounted(() => {
  checkUserRoles();
});

const closeSheet = () => {
  isOpen.value = false;
};

const navigateTo = (path) => {
  closeSheet();
  router.push(path);
};
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="py-3 px-4 flex items-center">
      <div class="mr-4 flex w-full">
        <router-link to="/" class="mr-6 flex items-center space-x-2">
          <span class="font-bold text-xl">DevOps Cloud</span>
        </router-link>
        <nav class="hidden md:flex items-center space-x-4 lg:space-x-6">
          <router-link 
            v-for="item in navItems" 
            :key="item.name"
            :to="item.path"
            class="text-sm font-medium transition-colors hover:text-primary"
          >
            {{ item.name }}
          </router-link>
        </nav>
      </div>
      <div class="flex flex-1 items-center justify-end space-x-4">
        <!-- User role badge (when authenticated) -->
        <Badge 
          v-if="authData && !error && userRoleBadge" 
          :variant="userRoleBadge.variant"
          class="hidden md:flex items-center gap-1"
        >
          <component :is="userRoleBadge.icon" class="h-3 w-3" />
          {{ userRoleBadge.text }}
        </Badge>
        
        <nav class="flex items-center space-x-2">
          <!-- Show these buttons when user is not authenticated -->
          <template v-if="!authData || error">
            <router-link to="/login" class="hidden md:flex">
              <Button variant="default" class="hidden md:flex cursor-pointer">
                Login
              </Button>
            </router-link>
            <router-link to="/signup" class="hidden md:flex">
              <Button variant="outline" class="hidden md:flex cursor-pointer">
                Sign up
              </Button>
            </router-link>
          </template>
          
          <!-- Show account button when user is authenticated -->
          <router-link v-if="authData && !error" to="/profile" class="hidden md:flex" asChild>
            <Button 
              variant="secondary" 
              class="hidden md:flex cursor-pointer"
            >
            <User2 />
            Account
          </Button>
          </router-link>
          <Sheet v-model:open="isOpen">
            <SheetTrigger asChild class="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu class="h-5 w-5" />
                <span class="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" class="pr-0">
              <div class="px-7">
                <router-link to="/" class="flex items-center" @click="closeSheet">
                  <span class="font-bold">DevOps Cloud</span>
                </router-link>
                <X
                  class="absolute right-4 top-4 h-4 w-4 cursor-pointer opacity-70"
                  @click="closeSheet"
                />
              </div>
              <div class="flex flex-col space-y-3 mt-8">
                <div
                  v-for="item in navItems"
                  :key="item.name"
                  class="px-7 py-2"
                >
                  <button
                    class="flex items-center gap-x-2 text-base font-semibold"
                    @click="navigateTo(item.path)"
                  >
                    <component :is="item.icon" class="h-5 w-5" />
                    {{ item.name }}
                  </button>
                </div>
                
                <!-- Authentication buttons for mobile -->
                <template v-if="!isAuthenticated">
                  <div class="px-7 py-2">
                    <button
                      class="flex items-center gap-x-2 text-base font-semibold"
                      @click="navigateTo('/login')"
                    >
                      <User class="h-5 w-5" />
                      Login
                    </button>
                  </div>
                  <div class="px-7 py-2">
                    <button
                      class="flex items-center gap-x-2 text-base font-semibold"
                      @click="navigateTo('/signup')"
                    >
                      <User class="h-5 w-5" />
                      Sign up
                    </button>
                  </div>
                </template>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </div>
  </header>
</template>
