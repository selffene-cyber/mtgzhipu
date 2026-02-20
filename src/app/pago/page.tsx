'use client';

import { PublicLayout } from '@/components/layout/public-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Building2,
  Smartphone,
  CheckCircle,
  Clock,
  Lock,
  Shield
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';

function PagoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const transactionId = searchParams.get('transactionId');
  const amount = searchParams.get('amount');

  const handlePayment = async () => {
    if (!selectedMethod) return;
    
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 2000);
  };

  if (success) {
    return (
      <div className="container px-4 py-16">
        <Card className="max-w-lg mx-auto text-center">
          <CardContent className="p-8">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Pago Exitoso!</h2>
            <p className="text-muted-foreground mb-6">
              Tu pago ha sido procesado correctamente. Recibirás un correo de confirmación 
              con los detalles de tu reserva.
            </p>
            <Badge className="mb-6">ID: {transactionId}</Badge>
            <Button onClick={() => router.push('/')} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Lock className="w-3 h-3 mr-1" />
            Pago Seguro
          </Badge>
          <h1 className="text-3xl font-bold mb-2">Completar Pago</h1>
          <p className="text-muted-foreground">
            Selecciona tu método de pago preferido
          </p>
        </div>

        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Resumen del Pago</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Abono de Reserva</p>
                <p className="text-sm text-muted-foreground">Transacción: {transactionId}</p>
              </div>
              <p className="text-2xl font-bold text-primary">
                ${parseInt(amount || '0').toLocaleString('es-CL')} CLP
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <div className="grid gap-4 mb-6">
          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'mercadopago' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedMethod('mercadopago')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">MercadoPago</p>
                  <p className="text-sm text-muted-foreground">Tarjetas de crédito, débito, saldo en cuenta</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${selectedMethod === 'mercadopago' ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                  {selectedMethod === 'mercadopago' && (
                    <CheckCircle className="w-full h-full text-white p-0.5" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'webpay' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedMethod('webpay')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">WebPay (Transbank)</p>
                  <p className="text-sm text-muted-foreground">Tarjetas de crédito y débito, Redcompra</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${selectedMethod === 'webpay' ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                  {selectedMethod === 'webpay' && (
                    <CheckCircle className="w-full h-full text-white p-0.5" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all ${selectedMethod === 'transfer' ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setSelectedMethod('transfer')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Transferencia Bancaria</p>
                  <p className="text-sm text-muted-foreground">Depósito o transferencia a cuenta corriente</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 ${selectedMethod === 'transfer' ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                  {selectedMethod === 'transfer' && (
                    <CheckCircle className="w-full h-full text-white p-0.5" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Transfer Info */}
        {selectedMethod === 'transfer' && (
          <Card className="mb-6 bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3">Datos para Transferencia</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Banco:</span>
                  <span className="font-medium">Banco de Chile</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de cuenta:</span>
                  <span className="font-medium">Cuenta Corriente</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Número:</span>
                  <span className="font-medium">1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RUT:</span>
                  <span className="font-medium">12.345.678-9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre:</span>
                  <span className="font-medium">MTG Automotora SpA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">pagos@mtgautomotora.cl</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pay Button */}
        <Button 
          className="w-full gradient-mtg h-12 text-lg"
          disabled={!selectedMethod || loading}
          onClick={handlePayment}
        >
          {loading ? (
            <>
              <Clock className="w-5 h-5 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 mr-2" />
              Pagar ${parseInt(amount || '0').toLocaleString('es-CL')} CLP
            </>
          )}
        </Button>

        {/* Security Note */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          <Lock className="w-3 h-3 inline mr-1" />
          Transacción segura con encriptación SSL
        </p>

        {/* Placeholder Notice */}
        <Card className="mt-6 bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Este es un ambiente de demostración. 
              Los pagos son simulados y no se procesan realmente. 
              En producción, se conectaría con WebPay y MercadoPago.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PagoLoading() {
  return (
    <div className="container px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export default function PagoPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<PagoLoading />}>
        <PagoContent />
      </Suspense>
    </PublicLayout>
  );
}
