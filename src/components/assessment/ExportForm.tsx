'use client';

import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { exportAssessment, sendAssessmentEmail } from '@/lib/api';

interface ExportFormProps {
  assessmentId: string;
}

interface FormData {
  name: string;
  email: string;
  organisationName: string;
  organisationRegNumber: string;
  wantsContact: boolean;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  organisationName: '',
  organisationRegNumber: '',
  wantsContact: true
};

export function ExportForm({ assessmentId }: ExportFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? '' : 'Palun sisestage korrektne e-posti aadress';
      case 'organisationRegNumber':
        const regNumberRegex = /^\d{8}$/;
        return value === '' || regNumberRegex.test(value) ? '' : 'Registrikood peab olema 8-kohaline number';
      case 'name':
        return value.trim().length > 0 ? '' : 'Nimi on kohustuslik';
      default:
        return '';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'organisationRegNumber') {
      // Only allow numbers and format them
      const numberValue = value.replace(/[^0-9]/g, '').slice(0, 8);
      setFormData(prev => ({
        ...prev,
        [name]: numberValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Validate the field
    if (type !== 'checkbox') {
      const fieldError = validateField(name, type === 'checkbox' ? checked.toString() : value);
      setFieldErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
    
    setError(null);
    setIsDataSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: { [key: string]: string } = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'wantsContact') {
        const error = validateField(key, value.toString());
        if (error) errors[key] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Palun täitke kõik kohustuslikud väljad korrektselt');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await exportAssessment(assessmentId, formData);
      setIsDataSaved(true);
    } catch (error) {
      console.error('Error saving form data:', error);
      setError('Viga andmete salvestamisel. Palun proovige uuesti.');
      setIsSubmitting(false);
      return;
    }
    setIsSubmitting(false);
  };

  const handleDownloadPDF = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDataSaved && formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
      if (error) return;
    }

    setIsSubmitting(true);
    try {
      const blob = await exportAssessment(assessmentId, formData);
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
      setError('Viga PDF-i allalaadimisel. Palun proovige uuesti.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isDataSaved && formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
      if (error) return;
    }

    setIsSubmitting(true);
    try {
      await sendAssessmentEmail(assessmentId, formData);
      alert('Hindamise tulemused on saadetud teie e-posti aadressile.');
    } catch (error) {
      console.error('Error sending email:', error);
      setError('Viga e-kirja saatmisel. Palun proovige uuesti.');
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
        <form ref={formRef} onSubmit={handleSubmit}>
          {error && <div role="alert" className="error">{error}</div>}
          {isDataSaved && <div role="status" className="success">Andmed on salvestatud</div>}

          <div className="form-group">
            <label htmlFor="name">
              Nimi *
              <span className="helper-text">Teie täisnimi</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className={fieldErrors.name ? 'error' : ''}
              aria-describedby="name-error"
            />
            {fieldErrors.name && (
              <div id="name-error" className="error-text">{fieldErrors.name}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="email">
              E-post *
              <span className="helper-text">Kasutatakse tulemuste saatmiseks</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={fieldErrors.email ? 'error' : ''}
              aria-describedby="email-error"
              placeholder="nimi@ettevote.ee"
            />
            {fieldErrors.email && (
              <div id="email-error" className="error-text">{fieldErrors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="organisationName">
              Organisatsiooni nimi
              <span className="helper-text">Ettevõtte või asutuse ametlik nimi</span>
            </label>
            <input
              type="text"
              id="organisationName"
              name="organisationName"
              value={formData.organisationName}
              onChange={handleInputChange}
              placeholder="Ettevõte OÜ"
            />
          </div>

          <div className="form-group">
            <label htmlFor="organisationRegNumber">
              Registrikood
              <span className="helper-text">8-kohaline äriregistri kood</span>
            </label>
            <input
              type="text"
              id="organisationRegNumber"
              name="organisationRegNumber"
              value={formData.organisationRegNumber}
              onChange={handleInputChange}
              pattern="[0-9]*"
              inputMode="numeric"
              maxLength={8}
              placeholder="12345678"
              className={fieldErrors.organisationRegNumber ? 'error' : ''}
              aria-describedby="reg-number-error"
            />
            {fieldErrors.organisationRegNumber && (
              <div id="reg-number-error" className="error-text">{fieldErrors.organisationRegNumber}</div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="wantsContact"
                checked={formData.wantsContact}
                onChange={handleInputChange}
              />
              <span>Soovin, et minuga võetaks ühendust AI-lahenduste juurutamiseks</span>
              <span className="helper-text">Võimaldab meil teiega ühendust võtta sobivate lahenduste osas</span>
            </label>
          </div>

          <div className="button-group">
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvestan...' : 'Salvesta'}
            </Button>
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