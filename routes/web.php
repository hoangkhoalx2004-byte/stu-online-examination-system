<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\ChapterController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TestController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Trang danh sách users (Frontend Inertia)
Route::get('/users', [UserController::class, 'index'])->name('users.index');

// API: CRUD Users
Route::get('/users/api/all', [UserController::class, 'apiIndex']);
Route::post('/users/api/create', [UserController::class, 'store'])->name('users.store');
Route::get('/users/api/detail/{id}', [UserController::class, 'apiShow']);
Route::put('/users/api/update/{id}', [UserController::class, 'update'])->name('users.update');
Route::delete('/users/api/delete/{id}', [UserController::class, 'destroy'])->name('users.destroy');
Route::post('/users/api/check', [UserController::class, 'checkUser']);
Route::post('/users/api/import', [UserController::class, 'importExcel'])->name('users.import');
Route::get('/users/api/roles', [UserController::class, 'getRoles']);
Route::patch('/users/api/toggle-status/{id}', [UserController::class, 'toggleStatus'])->name('users.toggleStatus');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::patch('/profile/password', [ProfileController::class, 'changePassword'])->name('profile.password');
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar'])->name('profile.avatar');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/profile/role', [ProfileController::class, 'getRole']);

    // Nhóm quyền (Roles)
    Route::resource('roles', RoleController::class)->except(['create', 'edit']);

    // Ngành/Khoa (Khoa)
    Route::resource('khoa', \App\Http\Controllers\KhoaController::class)->except(['create', 'edit', 'show']);

    // Môn học (Subject)
    Route::resource('subject', SubjectController::class)->except(['create', 'edit', 'show']);

    // Câu hỏi (Questions)
    Route::get('/questions', [\App\Http\Controllers\QuestionController::class, 'index'])->name('questions.index');
    Route::post('/questions', [\App\Http\Controllers\QuestionController::class, 'store'])->name('questions.store');
    Route::put('/questions/{id}', [\App\Http\Controllers\QuestionController::class, 'update'])->name('questions.update');
    Route::delete('/questions/{id}', [\App\Http\Controllers\QuestionController::class, 'destroy'])->name('questions.destroy');

    // Chương (Chapter)
    Route::get('/chapters/subject/{mamonhoc}', [ChapterController::class, 'getBySubject'])->name('chapters.bySubject');
    Route::post('/chapters', [ChapterController::class, 'store'])->name('chapters.store');
    Route::put('/chapters/{id}', [ChapterController::class, 'update'])->name('chapters.update');
    Route::delete('/chapters/{id}', [ChapterController::class, 'destroy'])->name('chapters.destroy');
    // Chapters...

    // Nhóm học phần (Module) - Cho giảng viên/admin
    Route::get('/modules', [\App\Http\Controllers\ModuleController::class, 'index'])->name('modules.index');
    Route::post('/modules', [\App\Http\Controllers\ModuleController::class, 'store'])->name('modules.store');
    Route::put('/modules/{id}', [\App\Http\Controllers\ModuleController::class, 'update'])->name('modules.update');
    Route::delete('/modules/{id}', [\App\Http\Controllers\ModuleController::class, 'destroy'])->name('modules.destroy');
    Route::patch('/modules/{id}/visibility', [\App\Http\Controllers\ModuleController::class, 'toggleVisibility']);
    Route::patch('/modules/{id}/invite-code', [\App\Http\Controllers\ModuleController::class, 'refreshInviteCode']);
    Route::get('/modules/{id}/students', [\App\Http\Controllers\ModuleController::class, 'getStudents']);
    Route::post('/modules/{id}/students', [\App\Http\Controllers\ModuleController::class, 'addStudent']);
    Route::delete('/modules/{id}/students/{uid}', [\App\Http\Controllers\ModuleController::class, 'removeStudent']);

    // Phân công (Assignment) - Cho admin
    Route::get('/assignment', [\App\Http\Controllers\AssignmentController::class, 'index'])->name('assignment.index');
    Route::post('/assignment', [\App\Http\Controllers\AssignmentController::class, 'store'])->name('assignment.store');

    // Xóa tất cả phân công trong hệ thống
    Route::post('/assignment/delete-all', [\App\Http\Controllers\AssignmentController::class, 'destroyAll'])->name('assignment.destroyAll');

    // Route cố định đặt TRƯỚC route có parameter để tránh conflict
    Route::post('/assignment/delete-user/{uid}', [\App\Http\Controllers\AssignmentController::class, 'destroyByUser'])->name('assignment.destroyByUser');
    Route::get('/assignment/user/{uid}', [\App\Http\Controllers\AssignmentController::class, 'getByUser']);

    // Route có 2 params đặt SAU
    Route::delete('/assignment/{mamonhoc}/{uid}', [\App\Http\Controllers\AssignmentController::class, 'destroy'])->name('assignment.destroy');

    // Học phần của sinh viên (Student Modules)
    Route::group(['prefix' => 'student'], function () {
        Route::get('/modules', [\App\Http\Controllers\StudentModuleController::class, 'index'])->name('student.modules.index');
        Route::post('/modules/join', [\App\Http\Controllers\StudentModuleController::class, 'join'])->name('student.modules.join');
        Route::delete('/modules/{id}/leave', [\App\Http\Controllers\StudentModuleController::class, 'leave'])->name('student.modules.leave');
        Route::patch('/modules/{id}/visibility', [\App\Http\Controllers\StudentModuleController::class, 'toggleVisibility'])->name('student.modules.visibility');
        Route::get('/modules/{id}/members', [\App\Http\Controllers\StudentModuleController::class, 'getMembers']);
        Route::get('/modules/{id}/tests', [\App\Http\Controllers\StudentModuleController::class, 'getTests']);
    });

    // Đề thi (Tests/Exams)
    Route::get('/tests', [TestController::class, 'index'])->name('tests.index');
    Route::get('/tests/create', [TestController::class, 'create'])->name('tests.create');
    Route::post('/tests', [TestController::class, 'store'])->name('tests.store');
    Route::get('/tests/{made}/edit', [TestController::class, 'edit'])->name('tests.edit');
    Route::put('/tests/{made}', [TestController::class, 'update'])->name('tests.update');

    // Chọn câu hỏi cho đề (manual)
    Route::get('/tests/{made}/select', [TestController::class, 'select'])->name('tests.select');
    Route::post('/tests/{made}/select', [TestController::class, 'saveSelectedQuestions'])->name('tests.select.save');

    // Lịch thi / đề đã giao (sinh viên)
    Route::get('/tests/schedule', [TestController::class, 'schedule'])->name('tests.schedule');

    // Vào thi / làm bài / nộp bài
    Route::get('/tests/{made}/start', [TestController::class, 'start'])->name('tests.start');
    Route::get('/tests/{made}/take', [TestController::class, 'take'])->name('tests.take');
    Route::post('/tests/{made}/submit', [TestController::class, 'submit'])->name('tests.submit');

    // Thống kê / kết quả (giảng viên)
    Route::get('/tests/{made}/results', [TestController::class, 'results'])->name('tests.results');
    Route::get('/tests/{made}/detail', [TestController::class, 'detail'])->name('tests.detail');
    Route::get('/tests/{made}/statistical', [TestController::class, 'getStatistical'])->name('tests.statistical');
    Route::get('/tests/{made}/scores', [TestController::class, 'getScores'])->name('tests.scores');
    Route::get('/tests/result/{makq}/detail', [TestController::class, 'getResultDetail'])->name('tests.result.detail');

    // Alias routes để khớp menu/layout cũ (dùng trong `global_menu`)
    Route::get('/test', [TestController::class, 'index'])->name('test.index');
    Route::get('/client/test', [TestController::class, 'schedule'])->name('client.test.schedule');
});

require __DIR__.'/auth.php';

