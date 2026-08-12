"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { VendorRegisterSchema, type VendorRegisterInput } from "@/lib/validations/auth"
import { registerVendorAction } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Category {
  id: string
  name: string
}

const GHANA_REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Northern",
  "Volta",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Savannah",
  "North East",
  "Oti",
  "Western North",
]

export default function VendorRegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [success, setSuccess] = useState(false)

  const form = useForm<VendorRegisterInput>({
    resolver: zodResolver(VendorRegisterSchema),
    defaultValues: {
      businessName: "",
      ownerFullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      primaryCategoryId: "",
      serviceLocations: [],
    },
  })

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/vendors/categories")
        if (res.ok) {
          const data = await res.json()
          setCategories(data)
        }
      } catch {
        // Categories will be empty, user can still try to register
      }
    }
    fetchCategories()
  }, [])

  async function onSubmit(values: VendorRegisterInput) {
    setError(null)
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("businessName", values.businessName)
      formData.append("ownerFullName", values.ownerFullName)
      formData.append("email", values.email)
      formData.append("phoneNumber", values.phoneNumber)
      formData.append("password", values.password)
      formData.append("confirmPassword", values.confirmPassword)
      formData.append("primaryCategoryId", values.primaryCategoryId)
      values.serviceLocations.forEach((location) => {
        formData.append("serviceLocations", location)
      })

      const result = await registerVendorAction(formData)

      if (!result.success) {
        setError(result.error)
        return
      }

      setSuccess(true)
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center text-primary">
            Registration submitted!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Your vendor registration is pending approval. Our team will review
            your application and notify you once approved.
          </p>
          <Button asChild className="w-full">
            <Link href="/login">Go to login</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Vendor Registration</CardTitle>
        <CardDescription className="text-center">
          Register your business to reach event customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div
            className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Accra Events Decor" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ownerFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Kwame Asante" autoComplete="name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="business@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+233XXXXXXXXX"
                      autoComplete="tel"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Ghana format: +233XXXXXXXXX or 0XXXXXXXXX
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Min 8 characters with uppercase, lowercase, and a number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primaryCategoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceLocations"
              render={() => (
                <FormItem>
                  <FormLabel>Service Locations</FormLabel>
                  <FormDescription>
                    Select the regions where you offer services
                  </FormDescription>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {GHANA_REGIONS.map((region) => (
                      <FormField
                        key={region}
                        control={form.control}
                        name="serviceLocations"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(region)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || []
                                  if (checked) {
                                    field.onChange([...current, region])
                                  } else {
                                    field.onChange(
                                      current.filter((v) => v !== region)
                                    )
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {region}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Register as vendor"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <p className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-sm text-muted-foreground text-center">
          Looking to book services?{" "}
          <Link
            href="/register/customer"
            className="text-primary font-medium hover:underline"
          >
            Register as a customer
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
