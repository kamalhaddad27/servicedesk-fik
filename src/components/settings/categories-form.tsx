"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSettings } from "@/hooks/use-settings"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AlertCircle, CheckCircle, Plus, X } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "../ui/badge"

// Form schema
const categorySchema = z.object({
  name: z.string().min(1, { message: "Nama kategori harus diisi" }),
  subcategories: z.array(z.string()).optional(),
})

export function CategoriesForm() {
  const { categories, isLoading, updateSetting } = useSettings()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newSubcategory, setNewSubcategory] = useState<string>("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

  // Form definition
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      subcategories: [],
    },
  })

  // Start editing a category
  const startEditCategory = (categoryKey: string) => {
    setEditingCategory(categoryKey)
    const category = categories?.[categoryKey]
    if (category) {
      form.reset({
        name: category.name,
        subcategories: category.subcategories || [],
      })
    }
  }

  // Cancel editing
  const cancelEdit = () => {
    setEditingCategory(null)
    form.reset()
  }

  // Add subcategory
  const addSubcategory = () => {
    if (!newSubcategory.trim()) return
    const currentSubcategories = form.getValues("subcategories") || []
    form.setValue("subcategories", [...currentSubcategories, newSubcategory])
    setNewSubcategory("")
  }

  // Remove subcategory
  const removeSubcategory = (index: number) => {
    const currentSubcategories = form.getValues("subcategories") || []
    form.setValue(
      "subcategories",
      currentSubcategories.filter((_, i) => i !== index)
    )
  }

  // Save category
  const saveCategory = async (values: z.infer<typeof categorySchema>) => {
    if (!editingCategory) return

    try {
      setError(null)
      const updatedCategories = { ...categories }
      updatedCategories[editingCategory] = {
        name: values.name,
        subcategories: values.subcategories || [],
      }

      await updateSetting.mutateAsync({
        key: "ticket-categories",
        value: updatedCategories,
      })

      setSuccess(`Kategori ${values.name} berhasil diperbarui`)
      setTimeout(() => setSuccess(null), 3000)
      setEditingCategory(null)
      form.reset()
    } catch (err) {
      setError("Gagal menyimpan kategori. Silakan coba lagi.")
    }
  }

  // Add new category
  const addNewCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      setError(null)
      const categoryKey = newCategoryName.toLowerCase().replace(/\s+/g, "_")
      const updatedCategories = { ...categories }
      updatedCategories[categoryKey] = {
        name: newCategoryName,
        subcategories: [],
      }

      await updateSetting.mutateAsync({
        key: "ticket-categories",
        value: updatedCategories,
      })

      setSuccess(`Kategori ${newCategoryName} berhasil ditambahkan`)
      setTimeout(() => setSuccess(null), 3000)
      setIsAddingCategory(false)
      setNewCategoryName("")
    } catch (err) {
      setError("Gagal menambahkan kategori. Silakan coba lagi.")
    }
  }

  // Delete category
  const deleteCategory = async (categoryKey: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori ini?`)) return

    try {
      setError(null)
      const updatedCategories = { ...categories }
      delete updatedCategories[categoryKey]

      await updateSetting.mutateAsync({
        key: "ticket-categories",
        value: updatedCategories,
      })

      setSuccess("Kategori berhasil dihapus")
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError("Gagal menghapus kategori. Silakan coba lagi.")
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {success && (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
        <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Kategori Tiket</h2>
        <Button onClick={() => setIsAddingCategory(true)} disabled={isAddingCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {isAddingCategory && (
        <Card>
          <CardHeader>
            <CardTitle>Tambah Kategori Baru</CardTitle>
            <CardDescription>Tambahkan kategori tiket baru ke sistem.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Nama kategori baru"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <Button onClick={addNewCategory} disabled={!newCategoryName.trim()}>
                Tambah
              </Button>
              <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {editingCategory ? (
        <Card>
          <CardHeader>
            <CardTitle>Edit Kategori</CardTitle>
            <CardDescription>Edit kategori tiket dan subkategorinya.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(saveCategory)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kategori</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama kategori" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Subkategori</FormLabel>
                  <div className="mt-2 space-y-2">
                    {form.watch("subcategories")?.map((subcategory, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input value={subcategory} disabled />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSubcategory(index)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Tambah subkategori baru"
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                      />
                      <Button type="button" onClick={addSubcategory} disabled={!newSubcategory.trim()}>
                        Tambah
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={updateSetting.isPending}>
                    {updateSetting.isPending ? "Menyimpan..." : "Simpan Kategori"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {categories &&
            Object.entries(categories).map(([key, category]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    {category.subcategories?.length
                      ? `${category.subcategories.length} subkategori`
                      : "Tidak ada subkategori"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((subcategory, index) => (
                        <Badge key={index} variant="outline">
                          {subcategory}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada subkategori yang ditentukan.</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => startEditCategory(key)}>
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => deleteCategory(key)}>
                    Hapus
                  </Button>
                </CardFooter>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
