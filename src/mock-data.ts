// Manually extract default values from campaign-template-component.ts
// Keep this in sync if you change defaults in the original file.
export const mockData = {
  interactionName: "Newsletter Signup from PopUp",
  imageUrl: "https://4711.com/cdn/shop/files/4711_AcquaColonia_Intense_Floral_Fields_Moodbild_07_1.jpg?v=1710839625",
  formHeader: "ABONNIERE JETZT UNSEREN 4711 NEWSLETTER",
  formSubheader: "& Erhalte einen 11%-Rabattcode für Deine nächste Bestellung!", // Keep HTML as string
  formButtonText: "Jetzt anmelden",
  formSmallCopy: "Hiermit bestelle ich den Newsletter. Ich stimme zu, dass meine hier angegebenen Daten zum Zwecke der Newsletterbestellung verarbeitet werden. Die weiteren Informationen zum <a href='https://www.m-w.de/datenschutz/'>Datenschutz</a> habe ich gelesen und verstanden, dass ich die Einwilligung zur Datenverarbeitung jederzeit widerrufen kann. Wir weisen darauf hin, dass wir in regelmäßigen Abständen die Adressen unserer Newsletter-Abonnenten für eine noch zielgruppengerechtere Ansprache durch Meta bewerten lassen.", // Keep HTML as string
  thankYouImageUrl: "https://d3k81ch9hvuctc.cloudfront.net/company/TEH66H/images/b2dae5b7-7bb5-4ae1-8bd6-cbd145797adf.jpeg",
  thankYouHeader: "NUR NOCH EIN SCHRITT!",
  thankYouCopy: "Soeben wurde eine E‑Mail mit einem Bestätigungslink an Dich versendet. Bitte klicke diesen an, um kostenfrei Duft-Neuigkeiten zu erhalten!" // Keep HTML as string
};

export type MockDataType = typeof mockData;
