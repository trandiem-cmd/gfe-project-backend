-- TABLE USERS --

CREATE TYPE user_role AS ENUM ('client', 'jobseeker');
CREATE TYPE user_service AS ENUM ('childcare', 'eldercare', 'cleaning');
CREATE TYPE user_experience AS ENUM ('0-1 years', '1-3 years', '3-5 years', '5+ years');
CREATE TYPE user_hourly_rate AS ENUM ('€10 - €15/hour', '€15 - €20/hour', '€20 - €25/hour', '€25+ /hour');

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    has_profile BOOLEAN DEFAULT FALSE,
    fullname VARCHAR(150),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    location VARCHAR(255),
    services user_service,
    about_you TEXT,
    experience user_experience,
    hourly_rate user_hourly_rate, 
    about_experience TEXT,
    skills TEXT,
    photo VARCHAR(255),
    is_paused BOOLEAN DEFAULT FALSE,
    languages TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE JOBPOSTS --

DROP TABLE IF EXISTS jobposts CASCADE;
CREATE TYPE service_type AS ENUM ('childcare', 'eldercare', 'cleaning');
CREATE TYPE service_frequency AS ENUM ('regular', 'occasional');
CREATE TABLE jobposts (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type service_type NOT NULL,
    service_title VARCHAR(255) NOT NULL,
    service_description TEXT,
    service_schedule TEXT,
    service_frequency VARCHAR(20) NOT NULL CHECK (service_frequency IN ('regular', 'occasional')),
    service_location VARCHAR(255) NOT NULL,
    service_pay_rate VARCHAR(20) NOT NULL,
    is_paused BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- TABLE APPLICATIONS --

CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
DROP TABLE IF EXISTS applications;
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL,
    jobseeker_id INTEGER NOT NULL,
    cover_letter TEXT,
	cv VARCHAR(50),
	status application_status DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Foreign keys
    CONSTRAINT fk_app_job FOREIGN KEY (job_id) REFERENCES jobposts(id) ON DELETE CASCADE,
    CONSTRAINT fk_app_user FOREIGN KEY (jobseeker_id) REFERENCES users(id) ON DELETE CASCADE,
    -- Prevent duplicate applications
    CONSTRAINT unique_application UNIQUE (job_id, jobseeker_id)
);

-- TABLE CONTACT_US --

DROP TABLE IF EXISTS contact_us
CREATE TABLE contact_us (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    full_name VARCHAR(100),
    email VARCHAR(100) NOT NULL,
	phone VARCHAR(20),
    subject VARCHAR(255),
    message TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE SET NULL
)

-- TABLE INBOX --

DROP TABLE IF EXISTS inbox CASCADE;
CREATE TABLE inbox (
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) ON DELETE CASCADE,
  receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- INSERT INTO TABLE USERS --
INSERT INTO users (email, password, role, has_profile, fullname, contact_email, contact_phone,location)
VALUES
('emma.virtanen@helsinki.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Emma Virtanen', 'emma.virtanen@helsinki.fi', '+358401111111', 'Helsinki - Lauttasaari'),
('oliver.korhonen@espoo.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Oliver Korhonen', 'oliver.korhonen@espoo.fi', '+358401111112','Espoo - Otaniemi'),
('sofia.makinen@tampere.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Sofia Mäkinen', 'sofia.makinen@tampere.fi', '+358401111113','Tampere - Kaleva'),
('liam.niemi@oulu.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Liam Niemi', 'liam.niemi@oulu.fi', '+358401111114','Oulu - Linnanmaa'),
('aava.lahtinen@turku.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Aava Lahtinen', 'aava.lahtinen@turku.fi', '+358401111115','Turku - Hirvensalo'),
('elias.heikkinen@helsinki.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Elias Heikkinen', 'elias.heikkinen@helsinki.fi', '+358401111116','Helsinki - Kamppi'),
('aino.koskinen@espoo.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Aino Koskinen', 'aino.koskinen@espoo.fi', '+358401111117','Espoo - Otaniemi'),
('noah.salminen@tampere.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Noah Salminen', 'noah.salminen@tampere.fi', '+358401111118','Tampere - Kaleva'),
('lumi.hamalainen@oulu.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Lumi Hämäläinen', 'lumi.hamalainen@oulu.fi', '+358401111119','Oulu - Rajakylä'),
('otto.lehtonen@turku.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'client', true, 'Otto Lehtonen', 'otto.lehtonen@turku.fi', '+358401111120','Turku - Nummi')

INSERT INTO users (email, password, role, has_profile, fullname, contact_email, contact_phone, location, services, about_you, experience, hourly_rate, about_experience, skills)
VALUES
('ville.hamalainen@oulu.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Ville Hämäläinen', 'ville.hamalainen@oulu.fi', '+358402222229', 'Oulu - Rajakylä', 'cleaning', 'I am a detail-oriented and hardworking person.', '1-3 years', '€15 - €20/hour', 'I have experience cleaning homes and apartments.', 'House Cleaning, Surface Cleaning'),
('ida.salminen@tampere.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Ida Salminen', 'ida.salminen@tampere.fi', '+358402222228', 'Tampere - Pyynikki', 'eldercare', 'I am patient, calm, and understanding.', '0-1 years', '€10 - €15/hour', 'I have supported elderly individuals in their daily lives.', 'Elder companionship, Meal preparation, Mobility assistance'),
('pekka.koskinen@espoo.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Pekka Koskinen', 'pekka.koskinen@espoo.fi', '+358402222227', 'Espoo - Matinkylä', 'eldercare', 'I am empathetic and dedicated to quality care.', '3-5 years', '€25+ /hour', 'I have experience helping elderly clients.', 'Elder companionship, Meal preparation'),
('anni.niemi@oulu.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Anni Niemi', 'anni.niemi@oulu.fi', '+358402222224', 'Oulu - Linnanmaa', 'childcare', 'I am kind and attentive with children.', '3-5 years', '€20 - €25/hour', 'I have experience working with young children.', 'Babysitting, Child supervision, Homework assistance'),
('teemu.makinen@tampere.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Teemu Mäkinen', 'teemu.makinen@tampere.fi', '+358402222223', 'Tampere - Kaleva', 'childcare', 'I am responsible and warm-hearted.', '1-3 years', '€15 - €20/hour', 'I have taken care of children in both part-time and full-time roles.', 'Babysitting, Homework assistance'),
('laura.korhonen@espoo.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Laura Korhonen', 'laura.korhonen@espoo.fi', '+358402222222', 'Espoo - Otaniemi', 'childcare', 'I am energetic and friendly with children.', '0-1 years', '€10 - €15/hour', 'I have worked as a babysitter for several families.', 'Babysitting, Child supervision'),
('mika.virtanen@helsinki.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Mika Virtanen', 'mika.virtanen@helsinki.fi', '+358402222221', 'Helsinki - Kamppi', 'childcare', 'I am a caring and patient person.', '0-1 years', '€10 - €15/hour', 'I have experience taking care of children of different ages.', 'Babysitting, Child supervision'),
('noora.lehtonen@turku.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Noora Lehtonen', 'noora.lehtonen@turku.fi', '+358402222230', 'Turku - Hirvensalo', 'cleaning', 'I am responsible and committed to delivering high quality cleaning services.', '3-5 years', '€25+ /hour', 'I have worked in residential cleaning for several clients.', 'House Cleaning, Surface Cleaning, Deep Cleaning, Laundry'),
('sara.heikkinen@helsinki.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Sara Heikkinen', 'sara.heikkinen@helsinki.fi', '+358402222226', 'Helsinki - Lauttasaari', 'eldercare', 'I am a caring and dependable person with a strong sense of responsibility.', '1-3 years', '€15 - €20/hour', 'I have worked with elderly individuals in home care settings.', 'Meal preparation, Mobility assistance, Medication management'),
('jani.lahtinen@turku.fi', '$2b$10$UkL5NetbjP3veCzBGS6MYeQD3mX3h7OnLEgTknU.rEEkQpgAqKYki', 'jobseeker', true, 'Jani Lahtinen', 'jani.lahtinen@turku.fi', '+358402222225', 'Turku - Nummi', 'eldercare', 'I am a compassionate and patient caregiver who enjoys helping elderly people.', '0-1 years', '€10 - €15/hour', 'I have experience assisting elderly clients with daily activities.', 'Meal preparation, Mobility assistance, Medication management');

-- INSERT INTO TABLE JOBPOSTS --

INSERT INTO jobposts (client_id, service_type, service_title, service_description, service_schedule, service_frequency, service_location, service_pay_rate)
VALUES
(1, 'childcare', 'Babysitter needed for 2 kids', 'Looking for a responsible babysitter for two children aged 4 and 7. Duties include preparing meals, homework help and playtime.', 'Mon-Fri 17:00-21:00', 'regular', 'Helsinki - Lauttasaari', '€15/hour'),
(2, 'cleaning', 'Apartment cleaning service', 'Need a reliable cleaner for a 2-bedroom apartment. Tasks include vacuuming, mopping and bathroom cleaning.', 'Saturday morning', 'regular', 'Espoo - Otaniemi', '€18/hour'),
(3, 'eldercare', 'Elderly companion needed', 'Seeking a kind caregiver for an elderly family member. Responsibilities include companionship and light meal preparation.', 'Daily 10:00-14:00', 'regular', 'Tampere - Kaleva', '€20/hour'),
(4, 'cleaning', 'House cleaning weekly', 'Looking for someone to help with weekly house cleaning. Tasks include dusting, vacuuming and kitchen cleaning.', 'Every Wednesday', 'regular', 'Oulu - Linnanmaa', '€17/hour'),
(5, 'childcare', 'Weekend babysitter', 'Need a babysitter during weekends for our toddler. Should be energetic and patient.', 'Weekend evenings', 'occasional', 'Turku - Hirvensalo', '€14/hour'),
(6, 'eldercare', 'Senior companion', 'Looking for a friendly companion for an elderly person. Light assistance and conversation required.', 'Mon-Wed mornings', 'regular', 'Espoo - Otaniemi', '€19/hour'),
(7, 'cleaning', 'Office cleaning', 'Need a cleaner for a small office. Tasks include cleaning desks, floors and restrooms.', 'Friday evening', 'regular', 'Tampere - Kaleva', '€20/hour'),
(8, 'childcare', 'After school babysitter', 'Looking for someone to pick up children from school and care for them until parents return.', 'Mon-Fri 15:00-18:00', 'regular', 'Oulu - Rajakylä', '€16/hour'),
(9, 'cleaning', 'Deep cleaning service', 'Need a cleaner for monthly deep cleaning. Tasks include detailed cleaning of kitchen appliances and bathrooms.', 'Once a month', 'occasional', 'Turku - Nummi', '€25/hour'),
(10, 'childcare', 'Evening babysitting', 'Looking for an occasional babysitter in the evenings. Should be trustworthy and caring.', 'Flexible evenings', 'occasional', 'Helsinki - Kallio', '€15/hour');

-- UPDATE TABLE USERS --

UPDATE users SET photo = 'candidate pic1 M.png' WHERE email = 'ville.hamalainen@oulu.fi';
UPDATE users SET photo = 'candidate pic2 F.jpg' WHERE email = 'noora.lehtonen@turku.fi';
UPDATE users SET photo = 'candidate pic7 F.jpg' WHERE email = 'ida.salminen@tampere.fi';
UPDATE users SET photo = 'candidate pic4 M.jpg' WHERE email = 'pekka.koskinen@espoo.fi';
UPDATE users SET photo = 'candidate pic8 F.jpg' WHERE email = 'sara.heikkinen@helsinki.fi';
UPDATE users SET photo = 'candidate pic6 M.jpg' WHERE email = 'jani.lahtinen@turku.fi';
UPDATE users SET photo = 'candidate pic10 F.jpg' WHERE email = 'anni.niemi@oulu.fi';
UPDATE users SET photo = 'candidate pic5 M.jpg' WHERE email = 'teemu.makinen@tampere.fi';
UPDATE users SET photo = 'candidate pic9 F.jpg' WHERE email = 'laura.korhonen@espoo.fi';
UPDATE users SET photo = 'candidate pic3 M.jpg' WHERE email = 'mika.virtanen@helsinki.fi';

-- UPDATE TABLE INBOX --

INSERT INTO inbox (sender_id, receiver_id, message_text) VALUES
(1, 11, 'Hi Ville! Are you available this weekend for cleaning?'),
(11, 1, 'Yes I am available! What time works for you?'),
(1, 11, 'Saturday morning around 10am works great!'),
(11, 1, 'Perfect, see you then! I will bring my own supplies.'),
(2, 18, 'Hello Noora! I saw your profile, very impressive experience.'),
(18, 2, 'Thank you! I would love to help. What do you need?'),
(2, 18, 'I need weekly cleaning for my apartment in Espoo.'),
(18, 2, 'That sounds great, I am available every Saturday!'),
(3, 19, 'Hi Sara! Are you experienced with eldercare?'),
(19, 3, 'Yes I have over a year of experience. I am very patient.'),
(3, 19, 'Perfect! Can you start next Monday?'),
(19, 3, 'Absolutely! I will be there at 10am.'),
(4, 13, 'Hello Pekka! I need help with my father.'),
(13, 4, 'Of course! I have 3-5 years experience in eldercare.'),
(4, 13, 'Great! Can we meet this week to discuss?'),
(13, 4, 'Sure, I am free Wednesday afternoon!'),
(5, 14, 'Hi Anni! Looking for a babysitter for my toddler.'),
(14, 5, 'I love working with children! How old is your child?'),
(5, 14, 'She is 3 years old. Weekends mostly.'),
(14, 5, 'That works perfectly for me!');