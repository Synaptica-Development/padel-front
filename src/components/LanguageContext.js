import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const translations = {
  en: {
    home: 'Home',
    aboutUs: 'About Us',
    contact: 'Contact',
    bookNow: 'Book Now',
    feelTheMovement: '"Feel the movement"',
    landingDescription: 'Redefining the Padel experience. 8 indoor courts alongside contrast recovery, face workouts and versatile studio space with stretching, mobility and yoga classes.',
    aboutUsTitle: 'About Us',
    aboutParagraph1: 'Padel Rocha is a premier padel club located in a serene recreational area at Turtle Lake. The club features 8 top panoramic courts, ample parking space, comfortable spectator seats, as well as modern administrative and shop facilities.',
    aboutParagraph2: 'Fully integrated into nature, the club gives you the chance to enjoy your game on world-class courts with stunning natural views. To elevate the quality of play, the courts are equipped with the latest HEXAGON CUP surface, recognized as a leading carpet worldwide.',
    aboutParagraph3: 'Notably, at registration you can request rackets and balls, which are provided completely free of charge. Additionally, if you wish, you can visit our shop, featuring products from the world\'s top brands.',
    aboutClosing: 'We wish you an enjoyable game at our club!',
    
    // Why Us Section
    whyUsTitle: 'Why Choose Padel Rocha',
    whyReasons: [
      {
        title: 'World-Class Courts',
        description: 'Experience premium padel on our 8 panoramic indoor courts equipped with HEXAGON CUP surface, the leading carpet technology worldwide.'
      },
      {
        title: 'Perfect Location',
        description: 'Nestled at Turtle Lake, our club offers breathtaking natural views while you play, creating an unmatched atmosphere for your game.'
      },
      {
        title: 'Complete Facilities',
        description: 'From free racket rentals to our pro shop featuring top brands, comfortable seating areas, and ample parking - we have everything you need.'
      },
      {
        title: 'Recovery & Wellness',
        description: 'Enhance your performance with our contrast recovery facilities, face workouts, and versatile studio space for stretching, mobility and yoga.'
      },
      {
        title: 'Professional Environment',
        description: 'Our modern administrative facilities and expert staff ensure a seamless experience from booking to post-game relaxation.'
      }
    ]
  },
  ka: {
    home: 'მთავარი',
    aboutUs: 'ჩვენს შესახებ',
    contact: 'კონტაქტი',
    bookNow: 'დაჯავშნე',
    feelTheMovement: '"იგრძენი მოძრაობა"',
    landingDescription: 'პადელის გამოცდილების ხელახალი განსაზღვრა. 8 შიდა კორტი კონტრასტული აღდგენის, სახის ვარჯიშებისა და მრავალფეროვანი სტუდიის სივრცის გვერდით გაჭიმვის, მობილურობისა და იოგას კლასებით.',
    aboutUsTitle: 'ჩვენს შესახებ',
    aboutParagraph1: 'Padel Rocha არის პრემიუმ პადელ კლუბი, რომელიც მდებარეობს კუს ტბის მშვიდ გარემოში. კლუბი შეიცავს 8 პანორამულ კორტს, ფართო პარკინგს, მაყურებლის კომფორტულ ადგილებს, ასევე თანამედროვე ადმინისტრაციულ და მაღაზიის შენობებს.',
    aboutParagraph2: 'ბუნებაში სრულად ინტეგრირებული, კლუბი გაძლევთ საშუალებას ისიამოვნოთ თამაშით მსოფლიო დონის კორტებზე ბუნების განსაცვიფრებელი ხედებით. თამაშის ხარისხის ასამაღლებლად, კორტები აღჭურვილია უახლესი HEXAGON CUP ზედაპირით, რომელიც აღიარებულია როგორც წამყვანი საფარი მსოფლიოში.',
    aboutParagraph3: 'სარეგისტრაციო დროს შეგიძლიათ მოითხოვოთ რაკეტები და ბურთები, რომლებიც უზრუნველყოფილია მთლიანად უფასოდ. გარდა ამისა, სურვილისამებრ, შეგიძლიათ ეწვიოთ ჩვენს მაღაზიას, რომელიც შეიცავს მსოფლიოს წამყვანი ბრენდების პროდუქტებს.',
    aboutClosing: 'გისურვებთ სასიამოვნო თამაშს ჩვენს კლუბში!',
    
    // Why Us Section
    whyUsTitle: 'რატომ აირჩიოთ Padel Rocha',
    whyReasons: [
      {
        title: 'მსოფლიო დონის კორტები',
        description: 'პრემიუმ პადელის გამოცდილება ჩვენს 8 პანორამულ შიდა კორტზე, აღჭურვილი HEXAGON CUP ზედაპირით, მსოფლიოში წამყვანი საფარის ტექნოლოგიით.'
      },
      {
        title: 'შესანიშნავი ლოკაცია',
        description: 'კუს ტბაზე განლაგებული ჩვენი კლუბი გთავაზობთ ბუნების სასწაულებრივ ხედებს თამაშის დროს, რაც ქმნის შეუდარებელ ატმოსფეროს.'
      },
      {
        title: 'სრული ინფრასტრუქტურა',
        description: 'უფასო რაკეტების დაქირავებიდან დაწყებული ჩვენს პრო მაღაზიამდე, კომფორტული მაყურებლის ადგილები და ფართო პარკინგი - ყველაფერი რაც გჭირდებათ.'
      },
      {
        title: 'აღდგენა და ველნესი',
        description: 'გააუმჯობესეთ თქვენი შესრულება ჩვენი კონტრასტული აღდგენის საშუალებებით, სახის ვარჯიშებით და მრავალფეროვანი სტუდიით გაჭიმვის, მობილურობის და იოგისთვის.'
      },
      {
        title: 'პროფესიონალური გარემო',
        description: 'ჩვენი თანამედროვე ადმინისტრაციული შენობები და ექსპერტი პერსონალი უზრუნველყოფს შეუფერხებელ გამოცდილებას დაჯავშნიდან თამაშის შემდეგ დასვენებამდე.'
      }
    ]
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ka' : 'en');
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};