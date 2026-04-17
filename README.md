# Dissertation Platform 

## 📌 Overview
This project presents the design and implementation of a **web-based Dissertation Management Platform** developed as part of the MSc Computing with Professinal placement at Edinburgh Napier University.  

The system aims to streamline the dissertation workflow by providing structured support for **students, supervisors, second markers, and module leaders**, improving transparency, efficiency, and academic coordination.

---

## 🎯 Aims and Objectives
- To develop a centralized platform for managing dissertation processes
- To support role-based access and functionality
- To enable efficient project allocation and supervision tracking
- To improve communication between stakeholders
- To provide structured data management through CSV imports and dashboards

---

## ⚙️ Tech Stack

### Backend
- Python (Django)
- Django REST Framework
- SQLite (development database)

### Frontend
- React (Vite)
- CSS

---

## 🧩 System Features

### 👨‍🎓 Student
- View assigned project and supervisors
- Select project preferences
- Track dissertation progress

### 👨‍🏫 Supervisor
- View assigned students
- Manage preferences and proposals
- Provide feedback

### 🧑‍⚖️ Second Marker
- Access assigned student records
- Review submissions

### 🧑‍💼 Module Leader
- Upload students, staff, and projects via CSV
- Allocate supervisors and second markers
- Manage system-wide data

---

## 🚀 Installation & Setup

# Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend Setup
cd ../frontend
npm install
npm run dev

## 📊 Key Contributions

- Designed a role-based system architecture
- Implemented CSV-based bulk data import functionality
- Developed RESTful APIs for seamless frontend-backend communication
- Built a responsive and user-friendly interface using React
- Ensured modular, maintainable, and scalable system design

## 🚧 Future Development

- Implementation of secure authentication mechanisms (e.g., JWT-based authentication)
- Integration of real-time notifications for updates and deadlines
- Enhancement of user interface and user experience (UI/UX)
- Addition of role-specific dashboards with advanced analytics
- Integration with university systems for automated data synchronization

