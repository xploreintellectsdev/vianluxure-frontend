import ContactHero from '@/components/Users/contactus/contactHero';
import ContactForm from '@/components/Users/contactus/contactForm';

async function getContactData() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${API_URL}/api/contact-page/page-data`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch contact page data');
    }
    
    const result = await res.json();
    return result.data;
  } catch (err) {
    console.error('Error fetching contact page data:', err);
    return { hero: null, infoItems: [] };
  }
}

export default async function ContactPage() {
  const data = await getContactData();
  
  return (
    <main>
      <ContactHero hero={data.hero} />
      <ContactForm infoItems={data.infoItems} hero={data.hero} />
    </main>
  );
}