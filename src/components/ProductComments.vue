<script setup>
import { ref, computed, onMounted } from 'vue';
import { createComment } from '../graphql/mutations';
import { commentsByProductId } from '../graphql/queries';
import { commentsByProductIdSafe, createCommentSafe } from '../graphql/custom-queries';
import { getCurrentUserInfo, canCommentOnProducts, ensureUserExists } from '../utils/auth-utils';
import api from '../utils/api-client';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { toast } from 'vue-sonner';

// UI Components
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageCircle, Send, Loader2, Calendar } from 'lucide-vue-next';

const props = defineProps({
  productId: {
    type: String,
    required: true
  }
});

// Reactive data
const comments = ref([]);
const loading = ref(true);
const submitting = ref(false);
const canComment = ref(false);
const currentUser = ref(null);

// Form validation schema
const commentSchema = toTypedSchema(
  z.object({
    content: z.string()
      .min(1, { message: 'Comment cannot be empty' })
      .max(1000, { message: 'Comment must not exceed 1000 characters' })
  })
);

// Form setup
const form = useForm({
  validationSchema: commentSchema,
  initialValues: {
    content: ''
  }
});

// Computed properties
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
});

// Methods
const fetchComments = async () => {
  try {
    loading.value = true;
    
    // Use safe query that doesn't include author relationship
    const response = await api.graphql({
      query: commentsByProductIdSafe,
      variables: { 
        productId: props.productId,
        sortDirection: 'DESC'
      }
    });
    
    if (response.errors) {
      console.error('GraphQL errors when fetching comments:', response.errors);
      response.errors.forEach((err, index) => {
        console.error(`Comment fetch error ${index + 1}:`, err.message, err.path);
      });
    }
    
    comments.value = response.data?.commentsByProductId?.items || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    
    // Log more details about the error
    if (error?.errors) {
      console.error('GraphQL errors:', error.errors);
      error.errors.forEach((err, index) => {
        console.error(`Error ${index + 1}:`, err.message, err.path);
      });
    }
    
    toast.error('Failed to load comments');
  } finally {
    loading.value = false;
  }
};

const checkUserPermissions = async () => {
  try {
    const userInfo = await getCurrentUserInfo();
    currentUser.value = userInfo.user;
    canComment.value = await canCommentOnProducts();
  } catch (error) {
    console.error('Error checking user permissions:', error);
    canComment.value = false;
  }
};

const submitComment = async (values) => {
  if (!canComment.value || !currentUser.value) {
    toast.error('You do not have permission to comment');
    return;
  }

  try {
    submitting.value = true;
    
    // Ensure user exists in DynamoDB before creating comment
    try {
      await ensureUserExists();
      console.log('User verified/created in DynamoDB');
    } catch (userError) {
      console.warn('Failed to ensure user exists:', userError);
      // Continue anyway - we'll just have the author relationship issue
      // but the comment will still be created
    }
    
    const commentInput = {
      content: values.content,
      productId: props.productId,
      authorId: currentUser.value.userId
    };

    const response = await api.graphql({
      query: createCommentSafe,
      variables: { input: commentInput }
    });

    // Add the new comment to the list
    comments.value.unshift(response.data.createComment);
    
    // Reset form
    form.resetForm();
    
    toast.success('Comment added successfully');
    
  } catch (error) {
    console.error('Error creating comment:', error);
    toast.error('Failed to add comment');
  } finally {
    submitting.value = false;
  }
};

const getInitials = (authorId) => {
  // For now, just use the first 2 characters of the author ID
  // In a real app, you might want to cache user info
  return authorId ? authorId.substring(0, 2).toUpperCase() : 'U';
};

const getAuthorName = (comment) => {
  // If we have author info from the relation, use it
  if (comment.author) {
    return comment.author.firstName && comment.author.lastName 
      ? `${comment.author.firstName} ${comment.author.lastName}`
      : comment.author.username || 'Anonymous';
  }
  
  // Otherwise, use authorId or fallback
  return `User ${comment.authorId ? comment.authorId.substring(0, 8) : 'Unknown'}`;
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  
  return date.toLocaleDateString();
};

// Lifecycle
onMounted(async () => {
  await checkUserPermissions();
  await fetchComments();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Comments Header -->
    <div class="flex items-center gap-2">
      <MessageCircle class="h-5 w-5" />
      <h3 class="text-lg font-semibold">Comments</h3>
      <span class="text-sm text-muted-foreground">({{ comments.length }})</span>
    </div>

    <!-- Add Comment Form (only for users with permission) -->
    <Card v-if="canComment">
      <CardHeader>
        <CardTitle class="text-base">Add a Comment</CardTitle>
      </CardHeader>
      <CardContent>
        <Form @submit="submitComment" class="space-y-4">
          <FormField
            v-slot="{ componentField }"
            name="content"
          >
            <FormItem>
              <FormLabel>Your Comment</FormLabel>
              <FormControl>
                <Textarea 
                  v-bind="componentField"
                  placeholder="Share your thoughts about this product..."
                  rows="3"
                  :disabled="submitting"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
          
          <Button 
            type="submit" 
            :disabled="submitting"
            class="flex items-center gap-2"
          >
            <Loader2 v-if="submitting" class="h-4 w-4 animate-spin" />
            <Send v-else class="h-4 w-4" />
            {{ submitting ? 'Posting...' : 'Post Comment' }}
          </Button>
        </Form>
      </CardContent>
    </Card>

    <!-- Permission Message for users who can't comment -->
    <Card v-else-if="!canComment && currentUser" class="border-amber-200 bg-amber-50">
      <CardContent class="pt-6">
        <p class="text-sm text-amber-800">
          You need user permissions to comment on products. Please contact an administrator.
        </p>
      </CardContent>
    </Card>

    <!-- Login required message -->
    <Card v-else class="border-blue-200 bg-blue-50">
      <CardContent class="pt-6">
        <p class="text-sm text-blue-800">
          Please log in to comment on products.
        </p>
      </CardContent>
    </Card>

    <!-- Comments List -->
    <div class="space-y-4">
      <!-- Loading state -->
      <div v-if="loading" class="space-y-4">
        <Card v-for="i in 3" :key="i">
          <CardContent class="pt-6">
            <div class="flex gap-3">
              <Skeleton class="h-10 w-10 rounded-full" />
              <div class="flex-1 space-y-2">
                <div class="flex items-center gap-2">
                  <Skeleton class="h-4 w-24" />
                  <Skeleton class="h-3 w-16" />
                </div>
                <Skeleton class="h-16 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- No comments -->
      <Card v-else-if="comments.length === 0">
        <CardContent class="pt-6">
          <div class="text-center text-muted-foreground">
            <MessageCircle class="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet. Be the first to share your thoughts!</p>
          </div>
        </CardContent>
      </Card>

      <!-- Comments -->
      <Card v-for="comment in sortedComments" :key="comment.id">
        <CardContent class="pt-6">
          <div class="flex gap-3">
            <!-- User Avatar -->
            <Avatar class="h-10 w-10">
              <AvatarFallback class="text-xs">
                {{ getInitials(comment.authorId) }}
              </AvatarFallback>
            </Avatar>

            <!-- Comment Content -->
            <div class="flex-1 space-y-2">
              <!-- Comment Header -->
              <div class="flex items-center gap-2 text-sm">
                <span class="font-medium">
                  {{ getAuthorName(comment) }}
                </span>
                <span class="text-muted-foreground">•</span>
                <span class="text-muted-foreground flex items-center gap-1">
                  <Calendar class="h-3 w-3" />
                  {{ formatDate(comment.createdAt) }}
                </span>
              </div>

              <!-- Comment Text -->
              <p class="text-sm whitespace-pre-line">{{ comment.content }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
