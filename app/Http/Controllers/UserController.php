<?php

namespace App\Http\Controllers;

use App\Models\UserModel;
use App\Models\NhomQuyenModel;
use App\Models\KhoaModel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{
    /**
     * Hiển thị danh sách users (Frontend - Inertia)
     */
    public function index(Request $request)
    {
       $query = UserModel::with(['khoa', 'nhomquyen'])
    ->select('id', 'hoten', 'email', 'gioitinh', 'ngaysinh', 'trangthai', 'manhomquyen', 'makhoa')
    ->orderByRaw("
        CASE 
            WHEN manhomquyen = 1 THEN 1  -- Admin
            WHEN manhomquyen = 2 THEN 2  -- Giảng viên
            WHEN manhomquyen = 3 THEN 3  -- Sinh viên
            ELSE 4
        END
    ");
        // Filter by role
        if ($request->has('role') && $request->role != 0) {
            $query->where('manhomquyen', $request->role);
        }

        // Filter by khoa
        if ($request->has('khoa') && $request->khoa != 0) {
            $query->where('makhoa', $request->khoa);
        }

        $users = $query->paginate(10)->withQueryString();
        
        $roles = NhomQuyenModel::where('trangthai', 1)->get();
        $khoas = KhoaModel::all(); // Lấy tất cả khoa

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'khoa']),
            'roles' => $roles,
            'khoas' => $khoas
        ]);
    }

    /**
     * API: Lấy tất cả users (JSON)
     */
    public function apiIndex()
    {
        $users = UserModel::with(['khoa', 'nhomquyen'])->get();
        return response()->json(['success' => true, 'data' => $users]);
    }

    /**
     * API: Lấy 1 user theo id (JSON)
     */
    public function apiShow(string $id)
    {
        $user = UserModel::with(['khoa', 'nhomquyen'])->find($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        return response()->json(['success' => true, 'data' => $user]);
    }

    /**
     * API: Tạo người dùng mới
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id' => 'required|string|max:20',
            'email' => 'required|email',
            'hoten' => 'required|string|max:255',
            'ngaysinh' => 'nullable|string',
            'gioitinh' => 'nullable|integer',
            'password' => 'required|string|min:6',
            'manhomquyen' => 'required|integer',
            'trangthai' => 'required|integer',
            'makhoa' => 'nullable|max:20',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $userModel = new UserModel();
            $userModel->createUser(
                $request->id,
                $request->email,
                $request->hoten,
                $request->password,
                $request->ngaysinh,
                $request->gioitinh ?? 1,
                $request->manhomquyen,
                $request->trangthai,
                $request->makhoa
            );

            return back()->with('success', 'Thêm người dùng thành công.');
        } catch (\Exception $e) {
            return back()->with('error', 'Không thể tạo người dùng: ' . $e->getMessage());
        }
    }

    /**
     * API: Cập nhật người dùng
     */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'hoten' => 'required|string|max:255',
            'ngaysinh' => 'nullable|string',
            'gioitinh' => 'nullable|integer',
            'password' => 'nullable|string|min:6',
            'manhomquyen' => 'required|integer',
            'trangthai' => 'required|integer',
            'makhoa' => 'nullable|max:20',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $userModel = new UserModel();
            $userModel->updateUser(
                $id,
                $request->email,
                $request->hoten,
                $request->password ?? '',
                $request->ngaysinh,
                $request->gioitinh ?? 1,
                $request->manhomquyen,
                $request->trangthai,
                $request->makhoa
            );

            return back()->with('success', 'Cập nhật người dùng thành công.');
        } catch (\Exception $e) {
            return back()->with('error', 'Không thể cập nhật: ' . $e->getMessage());
        }
    }

    /**
     * API: Xóa người dùng
     */
    public function destroy(string $id)
    {
        try {
            $userModel = new UserModel();
            $result = $userModel->deleteUser($id);
            if (!$result) {
                return back()->with('error', 'Không thể xóa người dùng.');
            }

            return back()->with('success', 'Đã xóa người dùng.');
        } catch (\Exception $e) {
            return back()->with('error', 'Lỗi khi xóa: ' . $e->getMessage());
        }
    }

    /**
     * API: Kiểm tra user tồn tại (MSSV hoặc Email)
     */
    public function checkUser(Request $request)
    {
        $mssv = $request->mssv;
        $email = $request->email;

        $userModel = new UserModel();
        $users = $userModel->checkUser($mssv, $email);

        return response()->json($users);
    }

    /**
     * API: Import Excel
     */
//     public function importExcel(Request $request)
// {
//     $request->validate([
//         'fileToUpload' => 'required|mimes:xlsx,xls,csv'
//     ]);

//     try {
//         $rows = Excel::toArray([], $request->file('fileToUpload'));

//         if (empty($rows) || empty($rows[0])) {
//             return redirect()->back()->with('error', 'File Excel không có dữ liệu');
//         }

//         $excelRows = $rows[0];

//         foreach ($excelRows as $index => $row) {

//             // Bỏ qua dòng tiêu đề
//             if ($index == 0) {
//                 continue;
//             }

//             // Kiểm tra dòng rỗng
//             if (empty($row[0]) || empty($row[1]) || empty($row[2])) {
//                 continue;
//             }

//             // Kiểm tra user đã tồn tại chưa
//             $existingUser = UserModel::where('id', $row[0])
//                 ->orWhere('email', $row[2])
//                 ->first();

//             if ($existingUser) {
//                 continue;
//             }

//            UserModel::create([
//                 'id' => $row[0],
//                 'hoten' => $row[1],
//                 'email' => $row[2],
//                 'ngaysinh' => $row[3] ?? null,
//                 'gioitinh' => $row[4] ?? 1,
//                 'password' => Hash::make($row[5] ?? '123456'),
//                 'manhomquyen' => $row[6] ?? 1,
//                 'trangthai' => $row[7] ?? 1,
//                 'makhoa' => $row[8] ?? null,
//             ]);
//         }

//         return redirect()->route('users.index')->with('success', 'Import Excel thành công');
//     } catch (\Exception $e) {
//         return redirect()->back()->with('error', 'Lỗi import Excel: ' . $e->getMessage());
//     }
// }
    /**
     * Lấy danh sách roles cho dropdown
     */
    public function getRoles()
    {
        $roles = NhomQuyenModel::where('trangthai', 1)->get();
        return response()->json($roles);
    }


    /**
     * API: Toggle trạng thái (active/inactive) của user
     */
    public function toggleStatus(string $id)
{
    try {
        $user = UserModel::find($id);

        if (!$user) {
            return back()->with('error', 'Không tìm thấy người dùng.');
        }

        $user->trangthai = $user->trangthai == 1 ? 0 : 1;
        $user->save();

        $message = $user->trangthai == 1
            ? 'Mở khóa tài khoản thành công.'
            : 'Khóa tài khoản thành công.';

        return back()->with('success', $message);
    } catch (\Exception $e) {
        return back()->with('error', 'Lỗi cập nhật trạng thái: ' . $e->getMessage());
    }
}
}
