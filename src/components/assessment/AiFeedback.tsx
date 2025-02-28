'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function AiFeedback() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tagasiside tehisaru analüüsist</CardTitle>
        <CardDescription>
          Teie ettevõte näitab tugevat potentsiaali mitmes valdkonnas. Eriti silmapaistev on teie sooritus kvaliteedijuhtimise ja innovatsiooni valdkonnas. Siiski on mõned võimalused edasisteks parandusteks, eriti seoses digitaliseerimise ja andmepõhise otsustamisega.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          <div>
            <div>
              <div></div>
              <h3>Peamised tugevused</h3>
            </div>
            <ul>
              <li>
                <span></span>
                <span>Tugev strateegiline planeerimine</span>
              </li>
              <li>
                <span></span>
                <span>Efektiivne meeskonnatöö</span>
              </li>
              <li>
                <span></span>
                <span>Kliendikeskne lähenemine</span>
              </li>
            </ul>
          </div>

          <div>
            <div>
              <div></div>
              <h3>Arendamist vajavad valdkonnad</h3>
            </div>
            <ul>
              <li>
                <span></span>
                <span>Digitaalsete lahenduste integreerimine</span>
              </li>
              <li>
                <span></span>
                <span>Andmepõhine otsustusprotsess</span>
              </li>
              <li>
                <span></span>
                <span>Automatiseerimine ja protsesside optimeerimine</span>
              </li>
            </ul>
          </div>
        </div>

        <div>
          * See tagasiside on genereeritud tehisintellekti poolt, põhinedes teie vastustel hindamisküsimustele.
        </div>
      </CardContent>
    </Card>
  );
} 