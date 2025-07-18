import React from "react";
import { TabsContent } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  TUpdatePasswordSchema,
  updatePasswordSchema,
} from "@/lib/validator/user";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updatePassword } from "@/lib/action/profile.action";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

const TabKeamanan = () => {
  const form = useForm<TUpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: TUpdatePasswordSchema) => {
    const result = await updatePassword(values);
    if (result.success) {
      toast.success(result.message);
      form.reset();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <TabsContent value="security" className="space-y-6">
      <Card>
        <CardHeader className="bg-primary-50 border-b border-primary-100">
          <CardTitle className="text-lg">Ubah Password</CardTitle>
          <CardDescription>Perbarui password akun Anda</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Saat Ini</FormLabel>
                    <FormControl>
                      <Input placeholder="Password saat ini" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password Baru</FormLabel>
                    <FormControl>
                      <Input placeholder="Password Baru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password Baru</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Konfirmasi Password Baru"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-2">
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-600"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Loading..." : "Ubah Password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default TabKeamanan;
