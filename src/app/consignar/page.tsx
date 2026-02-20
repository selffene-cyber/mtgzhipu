'use client';

import { PublicLayout } from '@/components/layout/public-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Send, 
  Car, 
  CheckCircle, 
  Phone, 
  Mail,
  FileText,
  Loader2
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createConsignment } from '@/lib/api-client';

const brands = ['Toyota', 'Chevrolet', 'Ford', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Honda', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi'];

export default function ConsignarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerRut: '',
    brand: '',
    model: '',
    year: '',
    km: '',
    expectedPrice: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await createConsignment({
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail || undefined,
        ownerPhone: formData.ownerPhone,
        ownerRut: formData.ownerRut || undefined,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        km: formData.km ? parseInt(formData.km) : undefined,
        expectedPrice: formData.expectedPrice ? parseInt(formData.expectedPrice) : undefined,
        notes: formData.notes || undefined,
      });

      if (data.success) {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting consignment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <PublicLayout>
        <div className="container px-4 py-16">
          <Card className="max-w-lg mx-auto text-center">
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">¡Solicitud Enviada!</h2>
              <p className="text-muted-foreground mb-6">
                Hemos recibido tu solicitud de consignación. Nuestro equipo se pondrá en contacto contigo 
                en las próximas 24 horas para revisar tu vehículo.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => router.push('/')}>Volver al inicio</Button>
                <Button variant="outline" onClick={() => setSuccess(false)}>Nueva solicitud</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Car className="w-3 h-3 mr-1" />
            Consignación
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Vende tu Vehículo con Nosotros</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Deja tu vehículo en consignación y nosotros nos encargamos de todo: evaluación, 
            fotografía profesional, publicación y venta.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Información del Vehículo</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Owner Info */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Datos del Propietario
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ownerName">Nombre completo *</Label>
                        <Input
                          id="ownerName"
                          value={formData.ownerName}
                          onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerRut">RUT</Label>
                        <Input
                          id="ownerRut"
                          value={formData.ownerRut}
                          onChange={(e) => setFormData({ ...formData, ownerRut: e.target.value })}
                          placeholder="12.345.678-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerPhone">Teléfono *</Label>
                        <Input
                          id="ownerPhone"
                          value={formData.ownerPhone}
                          onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                          placeholder="+56 9 1234 5678"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ownerEmail">Email</Label>
                        <Input
                          id="ownerEmail"
                          type="email"
                          value={formData.ownerEmail}
                          onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Car className="w-4 h-4" />
                      Datos del Vehículo
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Marca *</Label>
                        <Select value={formData.brand} onValueChange={(v) => setFormData({ ...formData, brand: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar marca" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Modelo *</Label>
                        <Input
                          id="model"
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Año *</Label>
                        <Input
                          id="year"
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          min="1990"
                          max={new Date().getFullYear() + 1}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="km">Kilometraje</Label>
                        <Input
                          id="km"
                          type="number"
                          value={formData.km}
                          onChange={(e) => setFormData({ ...formData, km: e.target.value })}
                          placeholder="50000"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="expectedPrice">Precio esperado (CLP)</Label>
                        <Input
                          id="expectedPrice"
                          type="number"
                          value={formData.expectedPrice}
                          onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                          placeholder="15000000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Comentarios adicionales</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Describe el estado del vehículo, extras, historia de mantenimiento..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full gradient-mtg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Solicitud
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Beneficios de Consignar</h3>
                <ul className="space-y-3">
                  {[
                    'Evaluación profesional gratuita',
                    'Fotografía de alta calidad',
                    'Publicación en múltiples plataformas',
                    'Filtro de compradores serios',
                    'Gestión de pruebas de manejo',
                    'Tramitación de documentos',
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Commission */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Comisión</h3>
                <p className="text-3xl font-bold text-primary mb-2">5%</p>
                <p className="text-sm text-muted-foreground">
                  Solo pagas si vendemos tu vehículo. Sin costos ocultos ni pagos por adelantado.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">¿Tienes preguntas?</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="https://wa.me/56912345678" target="_blank">
                      <Phone className="w-4 h-4 mr-2" />
                      WhatsApp
                    </a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="mailto:consignaciones@mtgautomotora.cl">
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
