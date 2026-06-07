import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import './SchoolProfile.css';

const API_BASE = 'http://localhost:8081/api';

const SchoolProfile = () => {
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';
  const [schoolData, setSchoolData] = useState(null);
  const [students, setStudents] = useState([]);
  const [baseCourses, setBaseCourses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [specialPageEnrollments, setSpecialPageEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(null);

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: '', email: '', phone: '', skills: '', disabilityType: '', bio: '', profileImageUrl: ''
  });
  const [courseForm, setCourseForm] = useState({
    courseTitle: '', description: '', category: '', startDate: '', endDate: '', 
    capacity: 30, syllabus: '', instructorName: '', instructorEmail: ''
  });
  const [enrollmentForm, setEnrollmentForm] = useState({
    studentId: '', courseId: '', status: 'ACTIVE', grade: '', attendancePercentage: ''
  });
  const [certForm, setCertForm] = useState({
    studentId: '', courseTitle: '', description: '', expiryDate: '', certificateImageUrl: ''
  });
  const [partnershipForm, setPartnershipForm] = useState({
    partnerName: '', partnerEmail: '', partnerPhone: '', partnershipType: '', 
    partnershipDetails: '', startDate: '', status: 'PENDING'
  });
  const [volunteerForm, setVolunteerForm] = useState({
    volunteerName: '', volunteerEmail: '', volunteerPhone: '', skills: '', role: 'MENTOR',
    availability: '', bio: '', profileImageUrl: ''
  });

  // Fetch school data
  useEffect(() => {
    const userEmail = user?.email;
    const token = localStorage.getItem('token');

    if (!userEmail || !token) {
      setLoading(false);
      setError('Please login again to load school data.');
      return;
    }

    const fetchSchoolData = async () => {
      try {
        setLoading(true);
        setError('');

        const schoolResponse = await fetch(`${API_BASE}/schools/email/${encodeURIComponent(userEmail)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!schoolResponse.ok) throw new Error('Failed to load school data');
        const school = await schoolResponse.json();
        setSchoolData(school);

        // Fetch related data
        const [studentsRes, coursesRes, enrollmentsRes, certsRes, partnershipsRes, volunteersRes] = await Promise.all([
          fetch(`${API_BASE}/schools/${school.id}/students`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/schools/${school.id}/courses`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/schools/${school.id}/enrollments`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/schools/${school.id}/certifications`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/schools/${school.id}/partnerships`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/schools/${school.id}/volunteers`, { headers: { 'Authorization': `Bearer ${token}` } }),
        ]);

        if (studentsRes.ok) setStudents(await studentsRes.json());
        if (coursesRes.ok) setBaseCourses(await coursesRes.json());
        if (enrollmentsRes.ok) setEnrollments(await enrollmentsRes.json());
        if (certsRes.ok) setCertifications(await certsRes.json());
        if (partnershipsRes.ok) setPartnerships(await partnershipsRes.json());
        if (volunteersRes.ok) setVolunteers(await volunteersRes.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolData();
  }, [user?.email]);

  useEffect(() => {
    if (!schoolData?.id) {
      setSpecialPageEnrollments([]);
      return;
    }

    const refreshEnrollments = async () => {
      const token = localStorage.getItem('token');
      const [specialRes, coursesRes] = await Promise.all([
        fetch(`${API_BASE}/schools/${schoolData.id}/special-enrollments`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/schools/${schoolData.id}/courses`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (specialRes.ok) {
        const rows = await specialRes.json();
        const safeRows = Array.isArray(rows) ? rows : [];
        setSpecialPageEnrollments(safeRows);
      }

      if (coursesRes.ok) {
        setBaseCourses(await coursesRes.json());
      }
    };

    refreshEnrollments();
    window.addEventListener('special-training-enrollments-updated', refreshEnrollments);
    return () => {
      window.removeEventListener('special-training-enrollments-updated', refreshEnrollments);
    };
  }, [schoolData?.id]);

  useEffect(() => {
    setCourses(baseCourses);
  }, [baseCourses]);

  const handleSubmitStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/schools/${schoolData.id}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(studentForm)
      });
      if (!response.ok) throw new Error('Failed to create student');
      const newStudent = await response.json();
      setStudents([...students, newStudent]);
      setStudentForm({ name: '', email: '', phone: '', skills: '', disabilityType: '', bio: '', profileImageUrl: '' });
      setShowForm(false);
      setSuccessMessage('Student profile created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/schools/${schoolData.id}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(courseForm)
      });
      if (!response.ok) throw new Error('Failed to create course');
      const newCourse = await response.json();
      setBaseCourses((prev) => [...prev, newCourse]);
      setCourseForm({ courseTitle: '', description: '', category: '', startDate: '', endDate: '', 
        capacity: 30, syllabus: '', instructorName: '', instructorEmail: '' });
      setShowForm(false);
      setSuccessMessage('Course created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitEnrollment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/schools/${schoolData.id}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student: { id: parseInt(enrollmentForm.studentId) },
          course: { id: parseInt(enrollmentForm.courseId) },
          status: enrollmentForm.status,
          grade: enrollmentForm.grade,
          attendancePercentage: enrollmentForm.attendancePercentage
        })
      });
      if (!response.ok) throw new Error('Failed to create enrollment');
      const newEnrollment = await response.json();
      setEnrollments([...enrollments, newEnrollment]);
      setEnrollmentForm({ studentId: '', courseId: '', status: 'ACTIVE', grade: '', attendancePercentage: '' });
      setShowForm(false);
      setSuccessMessage('Student enrolled successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitCertificate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/schools/${schoolData.id}/certifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student: { id: parseInt(certForm.studentId) },
          courseTitle: certForm.courseTitle,
          description: certForm.description,
          expiryDate: certForm.expiryDate,
          certificateImageUrl: certForm.certificateImageUrl
        })
      });
      if (!response.ok) throw new Error('Failed to issue certificate');
      const newCert = await response.json();
      setCertifications([...certifications, newCert]);
      setCertForm({ studentId: '', courseTitle: '', description: '', expiryDate: '', certificateImageUrl: '' });
      setShowForm(false);
      setSuccessMessage('Certificate issued successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitPartnership = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/schools/${schoolData.id}/partnerships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(partnershipForm)
      });
      if (!response.ok) throw new Error('Failed to create partnership');
      const newPartnership = await response.json();
      setPartnerships([...partnerships, newPartnership]);
      setPartnershipForm({ partnerName: '', partnerEmail: '', partnerPhone: '', partnershipType: '', 
        partnershipDetails: '', startDate: '', status: 'PENDING' });
      setShowForm(false);
      setSuccessMessage('Partnership request created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitVolunteer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/schools/${schoolData.id}/volunteers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(volunteerForm)
      });
      if (!response.ok) throw new Error('Failed to add volunteer');
      const newVolunteer = await response.json();
      setVolunteers([...volunteers, newVolunteer]);
      setVolunteerForm({ volunteerName: '', volunteerEmail: '', volunteerPhone: '', skills: '', role: 'MENTOR',
        availability: '', bio: '', profileImageUrl: '' });
      setShowForm(false);
      setSuccessMessage('Volunteer added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await fetch(`${API_BASE}/schools/students/${studentId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setStudents(students.filter(s => s.id !== studentId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const deleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await fetch(`${API_BASE}/schools/courses/${courseId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setBaseCourses((prev) => prev.filter(c => c.id !== courseId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const deletePartnership = async (partnershipId) => {
    if (window.confirm('Are you sure you want to delete this partnership?')) {
      try {
        await fetch(`${API_BASE}/schools/partnerships/${partnershipId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setPartnerships(partnerships.filter(p => p.id !== partnershipId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const deleteVolunteer = async (volunteerId) => {
    if (window.confirm('Are you sure you want to delete this volunteer?')) {
      try {
        await fetch(`${API_BASE}/schools/volunteers/${volunteerId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        setVolunteers(volunteers.filter(v => v.id !== volunteerId));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
      Loading school data...
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (!schoolData) return <div style={{ padding: '20px' }}>School not found</div>;

  return (
    <div className="school-content-wrapper">
      {/* Page Header */}
      <div className="school-page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {schoolData.logoUrl && (
            <img src={schoolData.logoUrl} alt="Logo" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
          )}
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>{schoolData.name}</h1>
            <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>
              {currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {error && <div className="error-toast">{error}</div>}
          {successMessage && <div className="success-toast">{successMessage}</div>}
        </div>
      </div>

      <div className="school-tab-content">
          {/* Overview Tab */}
          {currentTab === 'overview' && (
            <div className="overview-section">
              <h4>School Profile</h4>
              <div className="profile-grid">
                <div><label>Name:</label> <p>{schoolData.name}</p></div>
                <div><label>Email:</label> <p>{schoolData.email}</p></div>
                <div><label>Phone:</label> <p>{schoolData.phone}</p></div>
                <div><label>City:</label> <p>{schoolData.city}</p></div>
                <div><label>State:</label> <p>{schoolData.state}</p></div>
                <div><label>Country:</label> <p>{schoolData.country}</p></div>
                <div><label>Website:</label> <p><a href={schoolData.websiteUrl} target="_blank">{schoolData.websiteUrl}</a></p></div>
                <div><label>Special School:</label> <p>{schoolData.specialSchool ? 'Yes' : 'No'}</p></div>
              </div>
              <div><label>Description:</label> <p>{schoolData.description}</p></div>
            </div>
          )}

          {/* Students Tab */}
          {currentTab === 'students' && (
            <div className="students-section">
              {/* Header row */}
              <div className="students-header">
                <div>
                  <h2 className="students-title">Students</h2>
                  <p className="students-subtitle">{students.length} enrolled student{students.length !== 1 ? 's' : ''}</p>
                </div>
                <button
                  className="st-add-btn"
                  onClick={() => { setFormType('student'); setShowForm(s => !s); }}
                >
                  {showForm && formType === 'student' ? '✕ Close' : '+ Add Student'}
                </button>
              </div>

              {/* Add Student Form */}
              {showForm && formType === 'student' && (
                <div className="st-form-panel">
                  <h3 className="st-form-title">New Student</h3>
                  <form className="st-form-grid" onSubmit={handleSubmitStudent}>
                    <div className="st-field">
                      <label>Full Name *</label>
                      <input placeholder="e.g. Riya Sharma" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} required />
                    </div>
                    <div className="st-field">
                      <label>Email *</label>
                      <input type="email" placeholder="riya@example.com" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} required />
                    </div>
                    <div className="st-field">
                      <label>Phone</label>
                      <input placeholder="+91 98765 43210" value={studentForm.phone} onChange={e => setStudentForm({...studentForm, phone: e.target.value})} />
                    </div>
                    <div className="st-field">
                      <label>Skills</label>
                      <input placeholder="Reading, Communication, Art" value={studentForm.skills} onChange={e => setStudentForm({...studentForm, skills: e.target.value})} />
                    </div>
                    <div className="st-field">
                      <label>Disability Type</label>
                      <input placeholder="e.g. Visual Impairment" value={studentForm.disabilityType} onChange={e => setStudentForm({...studentForm, disabilityType: e.target.value})} />
                    </div>
                    <div className="st-field">
                      <label>Profile Image URL</label>
                      <input placeholder="https://..." value={studentForm.profileImageUrl} onChange={e => setStudentForm({...studentForm, profileImageUrl: e.target.value})} />
                    </div>
                    <div className="st-field st-field--full">
                      <label>Bio</label>
                      <textarea placeholder="A short description about the student..." value={studentForm.bio} onChange={e => setStudentForm({...studentForm, bio: e.target.value})} />
                    </div>
                    <div className="st-form-actions">
                      <button type="submit" className="st-btn-primary">Create Student</button>
                      <button type="button" className="st-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Students Table */}
              {students.length === 0 ? (
                <div className="st-empty">
                  <div className="st-empty-icon">👨‍🎓</div>
                  <p className="st-empty-title">No students yet</p>
                  <p className="st-empty-sub">Click "Add Student" to enroll the first student.</p>
                </div>
              ) : (
                <div className="st-table-wrap">
                  <table className="st-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Contact</th>
                        <th>Skills</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, idx) => {
                        const initials = (student.name || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                        const colors = ['#16a34a','#1a8fd1','#7c3aed','#d97706','#db2777'];
                        const bg = colors[idx % colors.length];
                        const statusClass = (student.status || 'active').toLowerCase();
                        return (
                          <tr key={student.id} className="st-row">
                            <td>
                              <div className="st-student-cell">
                                {student.profileImageUrl ? (
                                  <img src={student.profileImageUrl} alt={student.name} className="st-avatar-img" />
                                ) : (
                                  <div className="st-avatar" style={{ background: bg }}>{initials}</div>
                                )}
                                <div>
                                  <div className="st-name">{student.name}</div>
                                  {student.disabilityType && <div className="st-disability">{student.disabilityType}</div>}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="st-contact-email">{student.email}</div>
                              {student.phone && <div className="st-contact-phone">{student.phone}</div>}
                            </td>
                            <td>
                              <div className="st-skills-wrap">
                                {(student.skills || '').split(',').filter(Boolean).slice(0, 3).map((sk, i) => (
                                  <span key={i} className="st-skill-tag">{sk.trim()}</span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <span className={`st-status st-status--${statusClass}`}>
                                {student.status || 'Active'}
                              </span>
                            </td>
                            <td>
                              <button className="st-delete-btn" onClick={() => deleteStudent(student.id)} title="Remove student">
                                🗑
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Courses Tab */}
          {currentTab === 'courses' && (
            <div className="students-section">
              {/* Header row */}
              <div className="students-header">
                <div>
                  <h2 className="students-title">Courses</h2>
                  <p className="students-subtitle">{courses.length} course{courses.length !== 1 ? 's' : ''} available</p>
                </div>
                <button
                  className="st-add-btn"
                  onClick={() => { setFormType('course'); setShowForm(s => !s); }}
                >
                  {showForm && formType === 'course' ? '✕ Close' : '+ Post Course'}
                </button>
              </div>

              {/* Add Course Form */}
              {showForm && formType === 'course' && (
                <div className="st-form-panel">
                  <h3 className="st-form-title">New Course</h3>
                  <form className="st-form-grid" onSubmit={handleSubmitCourse}>
                    <div className="st-field">
                      <label>Course Title *</label>
                      <input placeholder="e.g. Basic Communication Skills" value={courseForm.courseTitle} onChange={e => setCourseForm({...courseForm, courseTitle: e.target.value})} required />
                    </div>
                    <div className="st-field">
                      <label>Category</label>
                      <input placeholder="e.g. Life Skills" value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})} />
                    </div>
                    <div className="st-field">
                      <label>Start Date *</label>
                      <input type="date" value={courseForm.startDate} onChange={e => setCourseForm({...courseForm, startDate: e.target.value})} required />
                    </div>
                    <div className="st-field">
                      <label>End Date *</label>
                      <input type="date" value={courseForm.endDate} onChange={e => setCourseForm({...courseForm, endDate: e.target.value})} required />
                    </div>
                    <div className="st-field">
                      <label>Capacity</label>
                      <input type="number" placeholder="30" value={courseForm.capacity} onChange={e => setCourseForm({...courseForm, capacity: parseInt(e.target.value)})} />
                    </div>
                    <div className="st-field">
                      <label>Instructor Name</label>
                      <input placeholder="e.g. Dr. Priya Nair" value={courseForm.instructorName} onChange={e => setCourseForm({...courseForm, instructorName: e.target.value})} />
                    </div>
                    <div className="st-field">
                      <label>Instructor Email</label>
                      <input type="email" placeholder="instructor@school.com" value={courseForm.instructorEmail} onChange={e => setCourseForm({...courseForm, instructorEmail: e.target.value})} />
                    </div>
                    <div className="st-field st-field--full">
                      <label>Description</label>
                      <textarea placeholder="What will students learn in this course?" value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} />
                    </div>
                    <div className="st-field st-field--full">
                      <label>Syllabus</label>
                      <textarea placeholder="Week 1: Introduction..." value={courseForm.syllabus} onChange={e => setCourseForm({...courseForm, syllabus: e.target.value})} />
                    </div>
                    <div className="st-form-actions">
                      <button type="submit" className="st-btn-primary">Create Course</button>
                      <button type="button" className="st-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Courses Table */}
              {courses.length === 0 ? (
                <div className="st-empty">
                  <div className="st-empty-icon">📚</div>
                  <p className="st-empty-title">No courses yet</p>
                  <p className="st-empty-sub">Click "Post Course" to create the first course.</p>
                </div>
              ) : (
                <div className="st-table-wrap">
                  <table className="st-table">
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Instructor</th>
                        <th>Dates</th>
                        <th>Capacity</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {courses.map((course, idx) => {
                        const catColors = ['#16a34a','#1a8fd1','#7c3aed','#d97706','#db2777'];
                        const catBg = catColors[idx % catColors.length];
                        const statusClass = (course.status || 'active').toLowerCase();
                        const enrolled = course.enrolled || 0;
                        const capacity = course.capacity || 1;
                        const pct = Math.min(Math.round((enrolled / capacity) * 100), 100);
                        return (
                          <tr key={course.id} className="st-row">
                            <td>
                              <div className="co-course-cell">
                                <div className="co-icon" style={{ background: catBg }}>
                                  📖
                                </div>
                                <div>
                                  <div className="st-name">{course.courseTitle}</div>
                                  {course.category && (
                                    <span className="co-category-tag">{course.category}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              {course.instructorName ? (
                                <>
                                  <div className="st-contact-email">{course.instructorName}</div>
                                  {course.instructorEmail && <div className="st-contact-phone">{course.instructorEmail}</div>}
                                </>
                              ) : (
                                <span className="st-contact-phone">—</span>
                              )}
                            </td>
                            <td>
                              <div className="co-date">{course.startDate || '—'}</div>
                              {course.endDate && <div className="st-contact-phone">to {course.endDate}</div>}
                            </td>
                            <td>
                              <div className="co-capacity-wrap">
                                <div className="co-capacity-text">
                                  <span>{enrolled}</span>
                                  <span className="st-contact-phone"> / {capacity}</span>
                                </div>
                                <div className="co-progress-bar">
                                  <div
                                    className="co-progress-fill"
                                    style={{
                                      width: `${pct}%`,
                                      background: pct >= 90 ? '#ef4444' : pct >= 60 ? '#d97706' : '#16a34a'
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className={`st-status st-status--${statusClass}`}>
                                {course.status || 'Active'}
                              </span>
                            </td>
                            <td>
                              <button className="st-delete-btn" onClick={() => deleteCourse(course.id)} title="Delete course">
                                🗑
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}


          {/* Enrollments Tab */}
          {currentTab === 'enrollments' && (
            <div>
              <button className="add-btn" onClick={() => { setFormType('enrollment'); setShowForm(true); }}>
                + Enroll Student
              </button>
              {showForm && formType === 'enrollment' && (
                <form className="form-container" onSubmit={handleSubmitEnrollment}>
                  <select value={enrollmentForm.studentId} onChange={(e) => setEnrollmentForm({...enrollmentForm, studentId: e.target.value})} required>
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <select value={enrollmentForm.courseId} onChange={(e) => setEnrollmentForm({...enrollmentForm, courseId: e.target.value})} required>
                    <option value="">Select Course</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.courseTitle}</option>)}
                  </select>
                  <select value={enrollmentForm.status} onChange={(e) => setEnrollmentForm({...enrollmentForm, status: e.target.value})}>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                  <input placeholder="Grade (A, B, C, etc.)" value={enrollmentForm.grade} onChange={(e) => setEnrollmentForm({...enrollmentForm, grade: e.target.value})} />
                  <input placeholder="Attendance %" type="number" value={enrollmentForm.attendancePercentage} onChange={(e) => setEnrollmentForm({...enrollmentForm, attendancePercentage: parseInt(e.target.value)})} />
                  <button type="submit">Enroll</button>
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </form>
              )}
              <div className="enrollments-list">
                {enrollments.map(enrollment => (
                  <div key={enrollment.id} className="enrollment-card">
                    <p><strong>Student ID:</strong> {enrollment.student.id}</p>
                    <p><strong>Course:</strong> {enrollment.course.courseTitle}</p>
                    <p><strong>Status:</strong> {enrollment.status}</p>
                    <p><strong>Grade:</strong> {enrollment.grade || 'N/A'} | <strong>Attendance:</strong> {enrollment.attendancePercentage || 'N/A'}%</p>
                    <p><strong>Enrollment Date:</strong> {enrollment.enrollmentDate}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '18px' }}>
                <h4 style={{ marginBottom: '10px' }}>Enrolled from Special Training Page</h4>
                {specialPageEnrollments.length === 0 ? (
                  <p style={{ color: '#64748b' }}>No learners enrolled yet from the /special/training page.</p>
                ) : (
                  <div className="enrollments-list">
                    {specialPageEnrollments.map((item) => (
                      <div key={item.id} className="enrollment-card">
                        <p><strong>Learner:</strong> {item.name || 'Unknown'}</p>
                        <p><strong>Email:</strong> {item.email || 'N/A'}</p>
                        <p><strong>Course:</strong> {item.courseTitle || 'N/A'}</p>
                        <p><strong>Status:</strong> {item.status || 'PENDING'}</p>
                        <p><strong>Enrolled At:</strong> {item.enrolledAt ? new Date(item.enrolledAt).toLocaleString('en-IN') : 'N/A'}</p>
                        {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certifications Tab */}
          {currentTab === 'certifications' && (
            <div>
              <button className="add-btn" onClick={() => { setFormType('certificate'); setShowForm(true); }}>
                + Issue Certificate
              </button>
              {showForm && formType === 'certificate' && (
                <form className="form-container" onSubmit={handleSubmitCertificate}>
                  <select value={certForm.studentId} onChange={(e) => setCertForm({...certForm, studentId: e.target.value})} required>
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <input placeholder="Course Title" value={certForm.courseTitle} onChange={(e) => setCertForm({...certForm, courseTitle: e.target.value})} required />
                  <textarea placeholder="Description" value={certForm.description} onChange={(e) => setCertForm({...certForm, description: e.target.value})} />
                  <input placeholder="Expiry Date" type="date" value={certForm.expiryDate} onChange={(e) => setCertForm({...certForm, expiryDate: e.target.value})} />
                  <input placeholder="Certificate Image URL" value={certForm.certificateImageUrl} onChange={(e) => setCertForm({...certForm, certificateImageUrl: e.target.value})} />
                  <button type="submit">Issue Certificate</button>
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </form>
              )}
              <div className="certifications-grid">
                {certifications.map(cert => (
                  <div key={cert.id} className="cert-card">
                    <h5>{cert.courseTitle}</h5>
                    <p><strong>Student:</strong> {cert.student.name}</p>
                    <p><strong>Certificate ID:</strong> {cert.certificateId}</p>
                    <p><strong>Issue Date:</strong> {cert.issueDate}</p>
                    <p><strong>Expiry Date:</strong> {cert.expiryDate || 'No expiry'}</p>
                    {cert.certificateImageUrl && <img src={cert.certificateImageUrl} alt="Certificate" style={{ maxWidth: '100%', marginTop: '10px' }} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partnerships Tab */}
          {currentTab === 'partnerships' && (
            <div>
              <button className="add-btn" onClick={() => { setFormType('partnership'); setShowForm(true); }}>
                + Create Partnership
              </button>
              {showForm && formType === 'partnership' && (
                <form className="form-container" onSubmit={handleSubmitPartnership}>
                  <input placeholder="Partner Name (NGO/Company)" value={partnershipForm.partnerName} onChange={(e) => setPartnershipForm({...partnershipForm, partnerName: e.target.value})} required />
                  <input placeholder="Partner Email" type="email" value={partnershipForm.partnerEmail} onChange={(e) => setPartnershipForm({...partnershipForm, partnerEmail: e.target.value})} required />
                  <input placeholder="Partner Phone" value={partnershipForm.partnerPhone} onChange={(e) => setPartnershipForm({...partnershipForm, partnerPhone: e.target.value})} />
                  <select value={partnershipForm.partnershipType} onChange={(e) => setPartnershipForm({...partnershipForm, partnershipType: e.target.value})} required>
                    <option value="">Select Partnership Type</option>
                    <option value="JOB_PLACEMENT">Job Placement</option>
                    <option value="TRAINING_SUPPORT">Training Support</option>
                    <option value="MENTORSHIP">Mentorship</option>
                    <option value="DONATION">Donation</option>
                    <option value="SKILL_DEVELOPMENT">Skill Development</option>
                  </select>
                  <textarea placeholder="Partnership Details" value={partnershipForm.partnershipDetails} onChange={(e) => setPartnershipForm({...partnershipForm, partnershipDetails: e.target.value})} />
                  <input placeholder="Start Date" type="date" value={partnershipForm.startDate} onChange={(e) => setPartnershipForm({...partnershipForm, startDate: e.target.value})} required />
                  <button type="submit">Send Partnership Request</button>
                  <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
                </form>
              )}
              <div className="partnerships-list">
                {partnerships.map(partnership => (
                  <div key={partnership.id} className="partnership-card">
                    <h5>{partnership.partnerName}</h5>
                    <p><strong>Type:</strong> {partnership.partnershipType}</p>
                    <p><strong>Email:</strong> {partnership.partnerEmail}</p>
                    <p><strong>Status:</strong> <span className={`status-badge ${partnership.status.toLowerCase()}`}>{partnership.status}</span></p>
                    <p><strong>Start Date:</strong> {partnership.startDate}</p>
                    <button onClick={() => deletePartnership(partnership.id)} className="delete-btn">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Volunteers Tab */}
          {currentTab === 'volunteers' && (
            <div className="students-section">
              {/* Header row */}
              <div className="students-header">
                <div>
                  <h2 className="students-title">Volunteers & Mentors</h2>
                  <p className="students-subtitle">{volunteers.length} volunteer{volunteers.length !== 1 ? 's' : ''} registered</p>
                </div>
                <button
                  className="st-add-btn"
                  onClick={() => { setFormType('volunteer'); setShowForm(s => !s); }}
                >
                  {showForm && formType === 'volunteer' ? '✕ Close' : '+ Add Volunteer'}
                </button>
              </div>

              {/* Add Volunteer Form */}
              {showForm && formType === 'volunteer' && (
                <div className="st-form-panel">
                  <h3 className="st-form-title">New Volunteer / Mentor</h3>
                  <form className="st-form-grid" onSubmit={handleSubmitVolunteer}>
                    <div className="st-field">
                      <label>Full Name *</label>
                      <input placeholder="e.g. Arjun Mehta" value={volunteerForm.volunteerName} onChange={e => setVolunteerForm({...volunteerForm, volunteerName: e.target.value})} required />
                    </div>
                    <div className="st-field">
                      <label>Email *</label>
                      <input type="email" placeholder="arjun@example.com" value={volunteerForm.volunteerEmail} onChange={e => setVolunteerForm({...volunteerForm, volunteerEmail: e.target.value})} required />
                    </div>
                    <div className="st-field">
                      <label>Phone</label>
                      <input placeholder="+91 98765 43210" value={volunteerForm.volunteerPhone} onChange={e => setVolunteerForm({...volunteerForm, volunteerPhone: e.target.value})} />
                    </div>
                    <div className="st-field">
                      <label>Role</label>
                      <select value={volunteerForm.role} onChange={e => setVolunteerForm({...volunteerForm, role: e.target.value})} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13.5, fontFamily: 'inherit', background: '#fff', color: '#0f172a', outline: 'none' }}>
                        <option value="MENTOR">Mentor</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="COUNSELOR">Counselor</option>
                        <option value="THERAPIST">Therapist</option>
                        <option value="COORDINATOR">Coordinator</option>
                      </select>
                    </div>
                    <div className="st-field">
                      <label>Skills</label>
                      <input placeholder="Sign Language, Braille, Art" value={volunteerForm.skills} onChange={e => setVolunteerForm({...volunteerForm, skills: e.target.value})} />
                    </div>
                    <div className="st-field">
                      <label>Availability</label>
                      <input placeholder="e.g. Mon–Fri, 2–4 PM" value={volunteerForm.availability} onChange={e => setVolunteerForm({...volunteerForm, availability: e.target.value})} />
                    </div>
                    <div className="st-field">
                      <label>Profile Image URL</label>
                      <input placeholder="https://..." value={volunteerForm.profileImageUrl} onChange={e => setVolunteerForm({...volunteerForm, profileImageUrl: e.target.value})} />
                    </div>
                    <div className="st-field st-field--full">
                      <label>Bio</label>
                      <textarea placeholder="A short description about the volunteer..." value={volunteerForm.bio} onChange={e => setVolunteerForm({...volunteerForm, bio: e.target.value})} />
                    </div>
                    <div className="st-form-actions">
                      <button type="submit" className="st-btn-primary">Add Volunteer</button>
                      <button type="button" className="st-btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Volunteers Table */}
              {volunteers.length === 0 ? (
                <div className="st-empty">
                  <div className="st-empty-icon">🤝</div>
                  <p className="st-empty-title">No volunteers yet</p>
                  <p className="st-empty-sub">Click "Add Volunteer" to register the first mentor or volunteer.</p>
                </div>
              ) : (
                <div className="st-table-wrap">
                  <table className="st-table">
                    <thead>
                      <tr>
                        <th>Volunteer</th>
                        <th>Role</th>
                        <th>Contact</th>
                        <th>Skills</th>
                        <th>Availability</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {volunteers.map((volunteer, idx) => {
                        const initials = (volunteer.volunteerName || 'V').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                        const colors = ['#16a34a','#1a8fd1','#7c3aed','#d97706','#db2777'];
                        const bg = colors[idx % colors.length];
                        const statusClass = (volunteer.status || 'active').toLowerCase();
                        const roleColors = {
                          MENTOR: { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
                          INSTRUCTOR: { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe' },
                          COUNSELOR: { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' },
                          THERAPIST: { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
                          COORDINATOR: { bg: '#fdf4ff', color: '#a21caf', border: '#f0abfc' },
                        };
                        const roleStyle = roleColors[volunteer.role] || roleColors.MENTOR;
                        return (
                          <tr key={volunteer.id} className="st-row">
                            <td>
                              <div className="st-student-cell">
                                {volunteer.profileImageUrl ? (
                                  <img src={volunteer.profileImageUrl} alt={volunteer.volunteerName} className="st-avatar-img" />
                                ) : (
                                  <div className="st-avatar" style={{ background: bg }}>{initials}</div>
                                )}
                                <div className="st-name">{volunteer.volunteerName}</div>
                              </div>
                            </td>
                            <td>
                              <span className="vo-role-badge" style={{ background: roleStyle.bg, color: roleStyle.color, border: `1px solid ${roleStyle.border}` }}>
                                {volunteer.role}
                              </span>
                            </td>
                            <td>
                              <div className="st-contact-email">{volunteer.volunteerEmail}</div>
                              {volunteer.volunteerPhone && <div className="st-contact-phone">{volunteer.volunteerPhone}</div>}
                            </td>
                            <td>
                              <div className="st-skills-wrap">
                                {(volunteer.skills || '').split(',').filter(Boolean).slice(0, 3).map((sk, i) => (
                                  <span key={i} className="st-skill-tag">{sk.trim()}</span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <div className="vo-availability">
                                {volunteer.availability || <span className="st-contact-phone">—</span>}
                              </div>
                            </td>
                            <td>
                              <span className={`st-status st-status--${statusClass}`}>
                                {volunteer.status || 'Active'}
                              </span>
                            </td>
                            <td>
                              <button className="st-delete-btn" onClick={() => deleteVolunteer(volunteer.id)} title="Remove volunteer">
                                🗑
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

      </div>
    </div>
  );
};

export default SchoolProfile;
