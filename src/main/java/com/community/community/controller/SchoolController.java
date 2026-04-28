package com.community.community.controller;

import com.community.community.model.*;
import com.community.community.repository.*;
import com.community.community.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;
    private final NeedRepository needRepository;
    private final SchoolAchievementRepository achievementRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificationRepository certificationRepository;
    private final SchoolPartnershipRepository partnershipRepository;
    private final SchoolVolunteerRepository volunteerRepository;
    private final SchoolRepository schoolRepository;
    private final SpecialCourseEnrollmentRepository specialCourseEnrollmentRepository;

    // ── School CRUD ──────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<School> createSchool(@RequestBody School school) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.createSchool(school));
    }

    @GetMapping
    public ResponseEntity<List<School>> getAllSchools() {
        return ResponseEntity.ok(schoolService.getAllSchools());
    }

    @GetMapping("/{id}")
    public ResponseEntity<School> getSchoolById(@PathVariable Long id) {
        return ResponseEntity.ok(schoolService.getSchoolById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<School> getSchoolByEmail(@PathVariable String email) {
        return ResponseEntity.ok(schoolService.getSchoolByEmail(email));
    }

    @GetMapping("/verified")
    public ResponseEntity<List<School>> getVerifiedSchools() {
        return ResponseEntity.ok(schoolService.getVerifiedSchools());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<School>> getSchoolsByCity(@PathVariable String city) {
        return ResponseEntity.ok(schoolService.getSchoolsByCity(city));
    }

    @GetMapping("/state/{state}")
    public ResponseEntity<List<School>> getSchoolsByState(@PathVariable String state) {
        return ResponseEntity.ok(schoolService.getSchoolsByState(state));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<School> updateSchool(@PathVariable Long id, @RequestBody School school) {
        return ResponseEntity.ok(schoolService.updateSchool(id, school));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<School> verifySchool(@PathVariable Long id) {
        return ResponseEntity.ok(schoolService.verifySchool(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteSchool(@PathVariable Long id) {
        schoolService.deleteSchool(id);
        return ResponseEntity.noContent().build();
    }

    // ── Requirements (Needs) Endpoints ──────────────────────────────────────

    @GetMapping("/{id}/needs")
    public ResponseEntity<List<Need>> getSchoolNeeds(@PathVariable Long id) {
        return ResponseEntity.ok(needRepository.findBySchoolId(id));
    }

    @PostMapping("/{id}/needs")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Need> postSchoolNeed(@PathVariable Long id, @RequestBody Need req) {
        School school = schoolService.getSchoolById(id);
        Need need = new Need();
        need.setTitle(req.getTitle());
        need.setDescription(req.getDescription());
        need.setCategory(req.getCategory());
        need.setTargetAmount(req.getTargetAmount() != null ? req.getTargetAmount() : BigDecimal.ZERO);
        need.setUrgent(req.getUrgent() != null && req.getUrgent());
        need.setDeadline(req.getDeadline());
        need.setStatus("ACTIVE");
        need.setSchool(school);
        return ResponseEntity.status(HttpStatus.CREATED).body(needRepository.save(need));
    }

    @PatchMapping("/needs/{needId}/close")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Need> closeNeed(@PathVariable Long needId) {
        Need need = needRepository.findById(needId)
                .orElseThrow(() -> new RuntimeException("Need not found"));
        need.setStatus("CLOSED");
        return ResponseEntity.ok(needRepository.save(need));
    }

    @DeleteMapping("/needs/{needId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNeed(@PathVariable Long needId) {
        needRepository.deleteById(needId);
        return ResponseEntity.noContent().build();
    }

    // ── Achievements Endpoints ───────────────────────────────────────────────

    /** Public – list all achievements for a school */
    @GetMapping("/{id}/achievements")
    public ResponseEntity<List<SchoolAchievement>> getAchievements(@PathVariable Long id) {
        return ResponseEntity.ok(achievementRepository.findBySchoolIdOrderByYearDescCreatedAtDesc(id));
    }

    /** Protected – create a new achievement */
    @PostMapping("/{id}/achievements")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SchoolAchievement> postAchievement(
            @PathVariable Long id,
            @RequestBody SchoolAchievement req) {
        School school = schoolService.getSchoolById(id);
        SchoolAchievement a = new SchoolAchievement();
        a.setTitle(req.getTitle());
        a.setDescription(req.getDescription());
        a.setCategory(req.getCategory() != null ? req.getCategory() : "OTHER");
        a.setYear(req.getYear());
        a.setImageUrl(req.getImageUrl());
        a.setSchool(school);
        return ResponseEntity.status(HttpStatus.CREATED).body(achievementRepository.save(a));
    }

    /** Protected – update an existing achievement */
    @PutMapping("/achievements/{achievementId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SchoolAchievement> updateAchievement(
            @PathVariable Long achievementId,
            @RequestBody SchoolAchievement req) {
        SchoolAchievement a = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));
        a.setTitle(req.getTitle());
        a.setDescription(req.getDescription());
        if (req.getCategory() != null) a.setCategory(req.getCategory());
        a.setYear(req.getYear());
        a.setImageUrl(req.getImageUrl());
        return ResponseEntity.ok(achievementRepository.save(a));
    }

    /** Protected – delete an achievement */
    @DeleteMapping("/achievements/{achievementId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteAchievement(@PathVariable Long achievementId) {
        achievementRepository.deleteById(achievementId);
        return ResponseEntity.noContent().build();
    }

    // ── Students Endpoints ───────────────────────────────────────────────────

    @GetMapping("/{id}/students")
    public ResponseEntity<List<Student>> getSchoolStudents(@PathVariable Long id) {
        School school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(studentRepository.findBySchool(school));
    }

    @PostMapping("/{id}/students")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Student> createStudent(@PathVariable Long id, @RequestBody Student student) {
        School school = schoolService.getSchoolById(id);
        student.setSchool(school);
        if (student.getEnrollmentDate() == null) {
            student.setEnrollmentDate(LocalDate.now());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(studentRepository.save(student));
    }

    @GetMapping("/students/{studentId}")
    public ResponseEntity<Student> getStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found")));
    }

    @PutMapping("/students/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Student> updateStudent(@PathVariable Long studentId, @RequestBody Student studentData) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (studentData.getName() != null) student.setName(studentData.getName());
        if (studentData.getEmail() != null) student.setEmail(studentData.getEmail());
        if (studentData.getPhone() != null) student.setPhone(studentData.getPhone());
        if (studentData.getSkills() != null) student.setSkills(studentData.getSkills());
        if (studentData.getDisabilityType() != null) student.setDisabilityType(studentData.getDisabilityType());
        if (studentData.getStatus() != null) student.setStatus(studentData.getStatus());
        if (studentData.getBio() != null) student.setBio(studentData.getBio());
        if (studentData.getProfileImageUrl() != null) student.setProfileImageUrl(studentData.getProfileImageUrl());
        return ResponseEntity.ok(studentRepository.save(student));
    }

    @DeleteMapping("/students/{studentId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long studentId) {
        studentRepository.deleteById(studentId);
        return ResponseEntity.noContent().build();
    }

    // ── Courses Endpoints ────────────────────────────────────────────────────

    @GetMapping("/courses/all")
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseRepository.findAll());
    }

    @GetMapping("/{id}/courses")
    public ResponseEntity<List<Course>> getSchoolCourses(@PathVariable Long id) {
        School school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(courseRepository.findBySchool(school));
    }

    @PostMapping("/{id}/courses")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Course> createCourse(@PathVariable Long id, @RequestBody Course course) {
        School school = schoolService.getSchoolById(id);
        course.setSchool(school);
        return ResponseEntity.status(HttpStatus.CREATED).body(courseRepository.save(course));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<Course> getCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found")));
    }

    @PutMapping("/courses/{courseId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Course> updateCourse(@PathVariable Long courseId, @RequestBody Course courseData) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        if (courseData.getCourseTitle() != null) course.setCourseTitle(courseData.getCourseTitle());
        if (courseData.getDescription() != null) course.setDescription(courseData.getDescription());
        if (courseData.getCategory() != null) course.setCategory(courseData.getCategory());
        if (courseData.getStartDate() != null) course.setStartDate(courseData.getStartDate());
        if (courseData.getEndDate() != null) course.setEndDate(courseData.getEndDate());
        if (courseData.getCapacity() != null) course.setCapacity(courseData.getCapacity());
        if (courseData.getStatus() != null) course.setStatus(courseData.getStatus());
        if (courseData.getSyllabus() != null) course.setSyllabus(courseData.getSyllabus());
        if (courseData.getInstructorName() != null) course.setInstructorName(courseData.getInstructorName());
        if (courseData.getInstructorEmail() != null) course.setInstructorEmail(courseData.getInstructorEmail());
        return ResponseEntity.ok(courseRepository.save(course));
    }

    @DeleteMapping("/courses/{courseId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        courseRepository.deleteById(courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/special-enrollments")
    public ResponseEntity<List<SpecialCourseEnrollment>> getSpecialCourseEnrollments(@PathVariable Long id) {
        return ResponseEntity.ok(specialCourseEnrollmentRepository.findBySchoolIdOrderByEnrolledAtDesc(id));
    }

    @PostMapping("/courses/{courseId}/special-enrollments")
    public ResponseEntity<?> createSpecialCourseEnrollment(
            @PathVariable Long courseId,
            @RequestBody Map<String, String> payload) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String name = payload.getOrDefault("name", "").trim();
        String email = payload.getOrDefault("email", "").trim();
        String notes = payload.getOrDefault("notes", "").trim();

        if (name.isEmpty() || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name and email are required"));
        }

        if (specialCourseEnrollmentRepository.existsByCourseIdAndEmailIgnoreCase(courseId, email)) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "You already enrolled in this course"));
        }

        SpecialCourseEnrollment enrollment = new SpecialCourseEnrollment();
        enrollment.setSchoolId(course.getSchool().getId());
        enrollment.setSchoolName(course.getSchool().getName());
        enrollment.setCourseId(course.getId());
        enrollment.setCourseTitle(course.getCourseTitle());
        enrollment.setName(name);
        enrollment.setEmail(email);
        enrollment.setNotes(notes);
        enrollment.setStatus("PENDING");
        enrollment.setSource("special-training-page");

        SpecialCourseEnrollment saved = specialCourseEnrollmentRepository.save(enrollment);

        course.setEnrolled(course.getEnrolled() + 1);
        courseRepository.save(course);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ── Enrollments Endpoints ────────────────────────────────────────────────

    @GetMapping("/{id}/enrollments")
    public ResponseEntity<List<Enrollment>> getSchoolEnrollments(@PathVariable Long id) {
        School school = schoolService.getSchoolById(id);
        List<Course> courses = courseRepository.findBySchool(school);
        List<Enrollment> enrollments = new java.util.ArrayList<>();
        for (Course course : courses) {
            enrollments.addAll(enrollmentRepository.findByCourse(course));
        }
        return ResponseEntity.ok(enrollments);
    }

    @PostMapping("/{id}/enrollments")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Enrollment> createEnrollment(@PathVariable Long id, @RequestBody Enrollment enrollment) {
        School school = schoolService.getSchoolById(id);
        // Verify student belongs to this school
        if (!enrollment.getStudent().getSchool().getId().equals(id)) {
            throw new RuntimeException("Student does not belong to this school");
        }
        if (enrollment.getEnrollmentDate() == null) {
            enrollment.setEnrollmentDate(LocalDate.now());
        }
        // Update course enrollment count
        Course course = enrollment.getCourse();
        course.setEnrolled(course.getEnrolled() + 1);
        courseRepository.save(course);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentRepository.save(enrollment));
    }

    @GetMapping("/enrollments/{enrollmentId}")
    public ResponseEntity<Enrollment> getEnrollment(@PathVariable Long enrollmentId) {
        return ResponseEntity.ok(enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found")));
    }

    @PutMapping("/enrollments/{enrollmentId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Enrollment> updateEnrollment(@PathVariable Long enrollmentId, @RequestBody Enrollment enrollmentData) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        if (enrollmentData.getStatus() != null) enrollment.setStatus(enrollmentData.getStatus());
        if (enrollmentData.getGrade() != null) enrollment.setGrade(enrollmentData.getGrade());
        if (enrollmentData.getAttendancePercentage() != null) enrollment.setAttendancePercentage(enrollmentData.getAttendancePercentage());
        if (enrollmentData.getRemarks() != null) enrollment.setRemarks(enrollmentData.getRemarks());
        return ResponseEntity.ok(enrollmentRepository.save(enrollment));
    }

    @DeleteMapping("/enrollments/{enrollmentId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long enrollmentId) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        // Update course enrollment count
        Course course = enrollment.getCourse();
        if (course.getEnrolled() > 0) {
            course.setEnrolled(course.getEnrolled() - 1);
            courseRepository.save(course);
        }
        enrollmentRepository.deleteById(enrollmentId);
        return ResponseEntity.noContent().build();
    }

    // ── Certifications Endpoints ─────────────────────────────────────────────

    @GetMapping("/{id}/certifications")
    public ResponseEntity<List<Certification>> getSchoolCertifications(@PathVariable Long id) {
        School school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(certificationRepository.findBySchool(school));
    }

    @PostMapping("/{id}/certifications")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Certification> issueCertification(@PathVariable Long id, @RequestBody Certification certification) {
        School school = schoolService.getSchoolById(id);
        certification.setSchool(school);
        if (certification.getIssueDate() == null) {
            certification.setIssueDate(LocalDate.now());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(certificationRepository.save(certification));
    }

    @GetMapping("/certifications/{certificateId}")
    public ResponseEntity<Certification> verifyCertificate(@PathVariable String certificateId) {
        return ResponseEntity.ok(certificationRepository.findByCertificateId(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found")));
    }

    @GetMapping("/students/{studentId}/certifications")
    public ResponseEntity<List<Certification>> getStudentCertifications(@PathVariable Long studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return ResponseEntity.ok(certificationRepository.findByStudent(student));
    }

    @DeleteMapping("/certifications/{certificationId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCertification(@PathVariable Long certificationId) {
        certificationRepository.deleteById(certificationId);
        return ResponseEntity.noContent().build();
    }

    // ── Partnerships Endpoints ───────────────────────────────────────────────

    @GetMapping("/{id}/partnerships")
    public ResponseEntity<List<SchoolPartnership>> getSchoolPartnerships(@PathVariable Long id) {
        School school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(partnershipRepository.findBySchool(school));
    }

    @PostMapping("/{id}/partnerships")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SchoolPartnership> createPartnership(@PathVariable Long id, @RequestBody SchoolPartnership partnership) {
        School school = schoolService.getSchoolById(id);
        partnership.setSchool(school);
        return ResponseEntity.status(HttpStatus.CREATED).body(partnershipRepository.save(partnership));
    }

    @GetMapping("/partnerships/{partnershipId}")
    public ResponseEntity<SchoolPartnership> getPartnership(@PathVariable Long partnershipId) {
        return ResponseEntity.ok(partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new RuntimeException("Partnership not found")));
    }

    @PutMapping("/partnerships/{partnershipId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SchoolPartnership> updatePartnership(@PathVariable Long partnershipId, @RequestBody SchoolPartnership partnershipData) {
        SchoolPartnership partnership = partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new RuntimeException("Partnership not found"));
        if (partnershipData.getPartnerName() != null) partnership.setPartnerName(partnershipData.getPartnerName());
        if (partnershipData.getPartnerEmail() != null) partnership.setPartnerEmail(partnershipData.getPartnerEmail());
        if (partnershipData.getPartnerPhone() != null) partnership.setPartnerPhone(partnershipData.getPartnerPhone());
        if (partnershipData.getPartnershipType() != null) partnership.setPartnershipType(partnershipData.getPartnershipType());
        if (partnershipData.getPartnershipDetails() != null) partnership.setPartnershipDetails(partnershipData.getPartnershipDetails());
        if (partnershipData.getStartDate() != null) partnership.setStartDate(partnershipData.getStartDate());
        if (partnershipData.getEndDate() != null) partnership.setEndDate(partnershipData.getEndDate());
        if (partnershipData.getStatus() != null) partnership.setStatus(partnershipData.getStatus());
        if (partnershipData.getAgreementUrl() != null) partnership.setAgreementUrl(partnershipData.getAgreementUrl());
        if (partnershipData.getNotes() != null) partnership.setNotes(partnershipData.getNotes());
        return ResponseEntity.ok(partnershipRepository.save(partnership));
    }

    @PatchMapping("/partnerships/{partnershipId}/status")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SchoolPartnership> updatePartnershipStatus(
            @PathVariable Long partnershipId,
            @RequestParam String status) {
        SchoolPartnership partnership = partnershipRepository.findById(partnershipId)
                .orElseThrow(() -> new RuntimeException("Partnership not found"));
        partnership.setStatus(status);
        return ResponseEntity.ok(partnershipRepository.save(partnership));
    }

    @DeleteMapping("/partnerships/{partnershipId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deletePartnership(@PathVariable Long partnershipId) {
        partnershipRepository.deleteById(partnershipId);
        return ResponseEntity.noContent().build();
    }

    // ── Volunteers Endpoints ─────────────────────────────────────────────────

    @GetMapping("/{id}/volunteers")
    public ResponseEntity<List<SchoolVolunteer>> getSchoolVolunteers(@PathVariable Long id) {
        School school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(volunteerRepository.findBySchool(school));
    }

    @PostMapping("/{id}/volunteers")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SchoolVolunteer> createVolunteer(@PathVariable Long id, @RequestBody SchoolVolunteer volunteer) {
        School school = schoolService.getSchoolById(id);
        volunteer.setSchool(school);
        if (volunteer.getJoinDate() == null) {
            volunteer.setJoinDate(LocalDate.now());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(volunteerRepository.save(volunteer));
    }

    @GetMapping("/volunteers/{volunteerId}")
    public ResponseEntity<SchoolVolunteer> getVolunteer(@PathVariable Long volunteerId) {
        return ResponseEntity.ok(volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer not found")));
    }

    @PutMapping("/volunteers/{volunteerId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SchoolVolunteer> updateVolunteer(@PathVariable Long volunteerId, @RequestBody SchoolVolunteer volunteerData) {
        SchoolVolunteer volunteer = volunteerRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer not found"));
        if (volunteerData.getVolunteerName() != null) volunteer.setVolunteerName(volunteerData.getVolunteerName());
        if (volunteerData.getVolunteerEmail() != null) volunteer.setVolunteerEmail(volunteerData.getVolunteerEmail());
        if (volunteerData.getVolunteerPhone() != null) volunteer.setVolunteerPhone(volunteerData.getVolunteerPhone());
        if (volunteerData.getSkills() != null) volunteer.setSkills(volunteerData.getSkills());
        if (volunteerData.getRole() != null) volunteer.setRole(volunteerData.getRole());
        if (volunteerData.getAvailability() != null) volunteer.setAvailability(volunteerData.getAvailability());
        if (volunteerData.getStatus() != null) volunteer.setStatus(volunteerData.getStatus());
        if (volunteerData.getBio() != null) volunteer.setBio(volunteerData.getBio());
        if (volunteerData.getProfileImageUrl() != null) volunteer.setProfileImageUrl(volunteerData.getProfileImageUrl());
        return ResponseEntity.ok(volunteerRepository.save(volunteer));
    }

    @DeleteMapping("/volunteers/{volunteerId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteVolunteer(@PathVariable Long volunteerId) {
        volunteerRepository.deleteById(volunteerId);
        return ResponseEntity.noContent().build();
    }
}
