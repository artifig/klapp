'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/UiButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/UiCard";

interface ExportFormProps {
  assessmentId: string;
}

export function ExportForm({ assessmentId }: ExportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organisationName: '',
    organisationRegNumber: '',
    wantsContact: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-valmiduse-hinnang.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Viga PDF-i allalaadimisel. Palun proovige uuesti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to send email');
      
      alert('Hindamise tulemused on saadetud teie e-posti aadressile.');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Viga e-kirja saatmisel. Palun proovige uuesti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Salvesta tulemused</CardTitle>
        <CardDescription>
          Täitke vorm, et saada tulemused PDF-ina või e-postiga
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div>
            <label htmlFor="name">Nimi</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="email">E-post</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="organisationName">Organisatsiooni nimi</label>
            <input
              type="text"
              id="organisationName"
              name="organisationName"
              value={formData.organisationName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label htmlFor="organisationRegNumber">Registrikood</label>
            <input
              type="text"
              id="organisationRegNumber"
              name="organisationRegNumber"
              value={formData.organisationRegNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                name="wantsContact"
                checked={formData.wantsContact}
                onChange={handleInputChange}
              />
              Soovin, et minuga võetaks ühendust AI-lahenduste juurutamiseks
            </label>
          </div>

          <div>
            <Button
              onClick={handleDownloadPDF}
              disabled={isSubmitting || !formData.email || !formData.name}
            >
              {isSubmitting ? 'Laadin alla...' : 'Laadi alla PDF'}
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSubmitting || !formData.email || !formData.name}
            >
              {isSubmitting ? 'Saadan...' : 'Saada e-postiga'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 