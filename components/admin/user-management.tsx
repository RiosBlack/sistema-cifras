"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"

const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(['USER', 'ADMIN']).default('USER')
})

const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Email inválido"),
  password: z
    .string()
    .optional(),
  role: z.enum(['USER', 'ADMIN'])
})

type CreateUserData = z.infer<typeof createUserSchema>
type UpdateUserData = z.infer<typeof updateUserSchema>

interface User {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
  updatedAt: string
  _count: {
    cifras: number
    repertorios: number
  }
}

interface UserManagementProps {
  mode: 'create' | 'edit'
  user?: User
  onSuccess: () => void
  onCancel: () => void
}

export function UserManagement({ mode, user, onSuccess, onCancel }: UserManagementProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schema = mode === 'create' ? createUserSchema : updateUserSchema
  type FormData = mode extends 'create' ? CreateUserData : UpdateUserData

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'edit' && user ? {
      name: user.name,
      email: user.email,
      role: user.role
    } : {
      name: '',
      email: '',
      password: '',
      role: 'USER'
    }
  })

  const watchedRole = watch('role')

  const handleFormSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const url = mode === 'create' 
        ? '/api/admin/users'
        : `/api/admin/users/${user?.id}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      const body = mode === 'create' 
        ? data 
        : {
            name: data.name,
            email: data.email,
            role: data.role,
            ...(data.password && { password: data.password })
          }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} usuário`)
      }

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Erro ao ${mode === 'create' ? 'criar' : 'atualizar'} usuário`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          type="text"
          placeholder="Nome completo"
          {...register("name")}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          {...register("email")}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={watchedRole}
          onValueChange={(value) => setValue('role', value as 'USER' | 'ADMIN')}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Usuário</SelectItem>
            <SelectItem value="ADMIN">Administrador</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="text-sm text-destructive">{errors.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Senha {mode === 'edit' && '(deixe em branco para manter a atual)'}
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={mode === 'create' ? "Digite a senha" : "Nova senha (opcional)"}
            {...register("password")}
            disabled={isLoading}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Ocultar senha" : "Mostrar senha"}
            </span>
          </Button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'create' ? 'Criando...' : 'Salvando...'}
            </>
          ) : (
            mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

