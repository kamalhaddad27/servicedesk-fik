'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Email login schema
const emailLoginSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

// NIM login schema
const nimLoginSchema = z.object({
  nim: z.string().min(8, { message: 'NIM tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

type EmailLoginValues = z.infer<typeof emailLoginSchema>;
type NIMLoginValues = z.infer<typeof nimLoginSchema>;

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function LoginForm() {
  const { login, error } = useAuth();
  const [activeTab, setActiveTab] = useState<'email' | 'nim'>('email');

  // Email login form
  const emailForm = useForm<EmailLoginValues>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // NIM login form
  const nimForm = useForm<NIMLoginValues>({
    resolver: zodResolver(nimLoginSchema),
    defaultValues: {
      nim: '',
      password: '',
    },
  });

  // Handle email login submit
  const onEmailSubmit = async (values: EmailLoginValues) => {
    await login({ email: values.email, password: values.password });
  };

  // Handle NIM login submit
  const onNIMSubmit = async (values: NIMLoginValues) => {
    await login({ nim: values.nim, password: values.password });
  };

  return (
    <motion.div
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <Tabs
        defaultValue="email"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'email' | 'nim')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">Login dengan Email</TabsTrigger>
          <TabsTrigger value="nim">Login dengan NIM</TabsTrigger>
        </TabsList>
        
        <TabsContent value="email" className="mt-4">
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={emailForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={emailForm.formState.isSubmitting}>
                {emailForm.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </TabsContent>
        
        <TabsContent value="nim" className="mt-4">
          <Form {...nimForm}>
            <form onSubmit={nimForm.handleSubmit(onNIMSubmit)} className="space-y-4">
              <FormField
                control={nimForm.control}
                name="nim"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIM</FormLabel>
                    <FormControl>
                      <Input placeholder="21105101001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={nimForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={nimForm.formState.isSubmitting}>
                {nimForm.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </motion.div>
  );
}
