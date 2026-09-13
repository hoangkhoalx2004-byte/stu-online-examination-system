import React, { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import MainLayout from '@/Components/MainLayouts';
import Pagination from '@/Components/Pagination';

export default function UsersIndex() {
    const { auth, users, filters, roles, khoas, flash, errors } = usePage().props;
    
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedRole, setSelectedRole] = useState(filters?.role || 0);
    const [selectedKhoa, setSelectedKhoa] = useState(filters?.khoa || 0);
    
    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [editingUser, setEditingUser] = useState(null);
    const [sortRole, setSortRole] = useState(filters?.sortRole || '');
    
    // Form states
    const [formData, setFormData] = useState({
        id: '',
        email: '',
        hoten: '',
        ngaysinh: '',
        gioitinh: 1,
        password: '',
        manhomquyen: '',
        trangthai: 1,
        makhoa: '',
    });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                router.get('/users', { search: searchTerm, role: selectedRole, khoa: selectedKhoa }, { preserveState: true, replace: true });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedRole, selectedKhoa]);

    // Đóng modal khi redirect kèm flash thành công (sau khi thêm/sửa qua Inertia)
    useEffect(() => {
        if (flash?.success) {
            setShowModal(false);
        }
    }, [flash?.success]);

    // Filter by role
    const handleRoleFilter = (roleId) => {
        setSelectedRole(roleId);
        router.get('/users', { search: searchTerm, role: roleId, khoa: selectedKhoa }, { preserveState: true, replace: true });
    };

    // Filter by khoa
    const handleKhoaFilter = (khoaId) => {
        setSelectedKhoa(khoaId);
        router.get('/users', { search: searchTerm, role: selectedRole, khoa: khoaId }, { preserveState: true, replace: true });
    };

    // Open Add Modal
    const openAddModal = () => {
        setModalMode('add');
        setEditingUser(null);
        setFormData({
            id: '',
            email: '',
            hoten: '',
            ngaysinh: '',
            gioitinh: 1,
            password: '',
            manhomquyen: roles && roles.length > 0 ? roles[0].manhomquyen : '',
            trangthai: 1,
            makhoa: khoas && khoas.length > 0 ? khoas[0].id : '',
        });
        setShowModal(true);
    };

    // Open Edit Modal
    const openEditModal = (user) => {
        setModalMode('edit');
        setEditingUser(user);
        setFormData({
            id: user.id,
            email: user.email,
            hoten: user.hoten,
            ngaysinh: user.ngaysinh || '',
            gioitinh: user.gioitinh ?? 1,
            password: '',
            manhomquyen: user.manhomquyen,
            trangthai: user.trangthai,
            makhoa: user.makhoa || '',
        });
        setShowModal(true);
    };

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Radio Change
    const handleRadioChange = (e) => {
        setFormData(prev => ({ ...prev, gioitinh: parseInt(e.target.value) }));
    };

    // Handle Switch Change
    const handleSwitchChange = (e) => {
        setFormData(prev => ({ ...prev, trangthai: e.target.checked ? 1 : 0 }));
    };

    // Handle Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const visitOptions = { preserveScroll: true };

        if (modalMode === 'add') {
            router.post(route('users.store'), formData, visitOptions);
        } else {
            router.put(route('users.update', editingUser.id), formData, visitOptions);
        }
    };

    // Handle Delete
    const handleDelete = (id) => {
        if (confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            router.delete(route('users.destroy', id), { preserveScroll: true });
        }
    };
    const handleToggleStatus = (user) => {
    const message =
        user.trangthai == 1
            ? 'Bạn có chắc chắn muốn khóa tài khoản này?'
            : 'Bạn có chắc chắn muốn mở khóa tài khoản này?';

    if (confirm(message)) {
        router.patch(route('users.toggleStatus', user.id), {}, { preserveScroll: true });
    }
};

    if (!users || !auth) {
        return (
            <div className="p-4 text-center">
                <i className="fa fa-spinner fa-spin fa-2x mb-3 text-primary"></i>
                <div>Đang tải dữ liệu hoặc thiếu thông tin xác thực...</div>
            </div>
        );
    }

    const { data: userList = [], links = [], total = 0, from = 0, to = 0 } = users;
    const user = auth.user;

    return (
        <MainLayout user={user}>
            <Head title="Quản lý người dùng" />
            <div className="content content-full">
                {flash?.success && (
                    <div className="alert alert-success rounded-2 mb-0 mt-4" role="alert">
                        <i className="fa fa-check-circle me-2"></i>
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="alert alert-danger rounded-2 mb-0 mt-4" role="alert">
                        <i className="fa fa-exclamation-circle me-2"></i>
                        {flash.error}
                    </div>
                )}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="alert alert-warning rounded-2 mb-0 mt-4" role="alert">
                        <strong>Vui lòng kiểm tra lại:</strong>
                        <ul className="mb-0 mt-2 ps-3">
                            {Object.entries(errors).map(([key, msg]) => (
                                <li key={key}>{Array.isArray(msg) ? msg.join(' ') : msg}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="block block-rounded mt-4 shadow-sm">
                    <div className="block-header block-header-default">
                        <h3 className="block-title">
                            <i className="fa fa-users me-2 text-primary"></i>
                            Quản lý người dùng
                        </h3>
                        <div className="block-options d-flex gap-2">
                             <input
                        type="file"
                        id="importExcelInput"
                        accept=".xlsx,.xls,.csv"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                            const file = e.target.files[0];

                            if (!file) return;

                            const formData = new FormData();
                            formData.append('fileToUpload', file);

                            router.post(route('users.import'), formData, {
                                forceFormData: true,
                                preserveScroll: true,
                                onSuccess: () => {
                                    document.getElementById('importExcelInput').value = '';
                                }
                           });
                        }}
                    />

                     {/* <button
                         className="btn btn-sm btn-success"
                         onClick={() => document.getElementById('importExcelInput').click()}
                     >
                         <i className="fa fa-file-excel me-1"></i> Import Excel
                     </button> */}
                 
                     <button className="btn btn-sm btn-primary" onClick={openAddModal}>
                         <i className="fa fa-plus me-1"></i> Thêm người dùng
                     </button>
                     </div>
                    </div>
                    <div className="block-content bg-body-dark">
                        {/* Search and Filter */}
                        <div className="row mb-4">
                            <div className="col-md-12 d-flex gap-3">
                                {/* Khoa Filter */}
                                <div className="dropdown">
                                    <button className="btn btn-alt-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {selectedKhoa == 0 ? 'Tất cả Khoa' : (khoas?.find(k => k.id == selectedKhoa)?.tenkhoa || 'Tất cả Khoa')}
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleKhoaFilter(0); }}>Tất cả Khoa</a></li>
                                        {khoas && khoas.map((khoa) => (
                                            <li key={khoa.id}><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleKhoaFilter(khoa.id); }}>{khoa.tenkhoa}</a></li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Role Filter */}
                                <div className="dropdown">
                                    <button className="btn btn-alt-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        {selectedRole == 0 ? 'Tất cả' : (roles?.find(r => r.manhomquyen == selectedRole)?.tennhomquyen || 'Tất cả')}
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleRoleFilter(0); }}>Tất cả</a></li>
                                        {roles && roles.map((role) => (
                                            <li key={role.manhomquyen}><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleRoleFilter(role.manhomquyen); }}>{role.tennhomquyen}</a></li>
                                        ))}
                                    </ul>
                                </div>
                                
                                {/* Search Input */}
                                <input
                                    type="text"
                                    className="form-control form-control-alt flex-grow-1"
                                    placeholder="Tìm kiếm người dùng (Tên, MSSV)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button
    className="btn btn-alt-primary"
    onClick={() => {
        const newSort = sortRole === 'role' ? '' : 'role';
        setSortRole(newSort);

        router.get('/users', {
            search: searchTerm,
            role: selectedRole,
            khoa: selectedKhoa,
            sortRole: newSort
        }, {
            preserveState: true,
            replace: true
        });
    }}
>
    <i className="fa fa-sort me-1"></i>
    {sortRole === 'role' ? 'Bỏ sắp xếp' : 'Sắp xếp theo nhóm quyền'}
</button>
                            </div>
                        </div>
                    </div>
                    <div className="block-content">
                        <div className="table-responsive">
                            <table className="table table-hover table-vcenter mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-center" style={{ width: '100px' }}>MSSV</th>
                                        <th>Họ tên</th>
                                        <th className="text-center">Giới tính</th>
                                        <th className="text-center">Ngày sinh</th>
                                        <th className="text-center">Khoa</th>
                                        <th className="text-center">Nhóm quyền</th>
                                        <th className="text-center">Trạng thái</th>
                                        <th className="text-center col-header-action">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {userList.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="text-center py-4 text-muted">
                                                <i className="fa fa-inbox fa-2x mb-2 d-block"></i>
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    ) : (
                                        userList.map((u, index) => (
                                            <tr key={u.id}>
                                                <td className="text-center fw-semibold">{u.id}</td>
                                                <td>{u.hoten}</td>
                                                <td className="text-center">{u.gioitinh == 1 ? 'Nam' : 'Nữ'}</td>
                                                <td className="text-center text-muted">{u.ngaysinh || '-'}</td>
                                                <td className="text-center">
                                                    <span className={`badge ${u.khoa ? 'bg-info' : 'bg-secondary'}`}>
                                                        {u.khoa?.tenkhoa || 'Chưa phân khoa'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge ${u.nhomquyen ? 'bg-primary' : 'bg-secondary'}`}>
                                                        {u.nhomquyen?.tennhomquyen || 'Chưa phân nhóm'}
                                                    </span>
                                                </td>
                                                <td className="text-center">
                                                    <span className={`badge ${u.trangthai == 1 ? 'bg-success' : 'bg-danger'}`}>
                                                        {u.trangthai == 1 ? 'Hoạt động' : 'Bị khóa'}
                                                    </span>
                                                </td>


                                                <td className="text-center">
                                                   <div className="btn-group">
                                               <button
                                                   className="btn btn-sm btn-alt-secondary"
                                                   onClick={() => openEditModal(u)}
                                                    title="Sửa"
                                               >
                                                   <i className="fa fa-pencil-alt text-info"></i>
                                               </button>

                                               {/* <button
                                                   className="btn btn-sm btn-alt-secondary"
                                                   onClick={() => handleToggleStatus(u)}
                                                   title={u.trangthai == 1 ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                               >
                                                   <i className={`fa ${u.trangthai == 1 ? 'fa-lock text-warning' : 'fa-unlock text-success'}`}></i>
                                               </button> */}

                                               <button
                                                   className="btn btn-sm btn-alt-secondary"
                                                   onClick={() => handleDelete(u.id)}
                                                   title="Xóa"
                                                   
                                               >
                                                   <i className="fa fa-times text-danger"></i>
                                               </button>
                                               
                                           </div>                                           
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="block-content block-content-full block-content-sm bg-body-light">
                        <Pagination links={links} />
                    </div>
                </div>
            </div>
              
            {/* Modal Add/Edit User */}
            {showModal && (
                <div className="modal fade show d-block" id="modal-add-user" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content">
                            <div className="block block-transparent bg-white mb-0 block-rounded">
                                <div className="block-header">
                                    <h3 className="block-title">{modalMode === 'add' ? 'Thêm người dùng' : 'Cập nhật người dùng'}</h3>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="block-content">
                                        {/* Form Fields */}
                                        <div className="mb-3">
                                            <label className="form-label">Mã sinh viên</label>
                                            <input type="text" className="form-control" name="id" value={formData.id} onChange={handleChange} disabled={modalMode === 'edit'} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Email</label>
                                            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Họ và tên</label>
                                            <input type="text" className="form-control" name="hoten" value={formData.hoten} onChange={handleChange} required />
                                        </div>
                                        
                                        {/* Khoa Dropdown */}
                                        <div className="mb-3">
                                            <label className="form-label">Khoa</label>
                                            <select className="form-select" name="makhoa" value={formData.makhoa} onChange={handleChange}>
                                                <option value="">Chọn khoa...</option>
                                                {khoas && khoas.map((khoa) => (
                                                    <option key={khoa.id} value={khoa.id}>{khoa.tenkhoa}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Giới tính</label>
                                            <div className="space-x-2">
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name="gioitinh" value="1" checked={formData.gioitinh == 1} onChange={handleRadioChange} />
                                                    <label className="form-check-label">Nam</label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input className="form-check-input" type="radio" name="gioitinh" value="0" checked={formData.gioitinh == 0} onChange={handleRadioChange} />
                                                    <label className="form-check-label">Nữ</label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Ngày sinh</label>
                                            <input type="date" className="form-control" name="ngaysinh" value={formData.ngaysinh} onChange={handleChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Nhóm quyền</label>
                                            <select className="form-select" name="manhomquyen" value={formData.manhomquyen} onChange={handleChange} required>
                                                <option value="">Chọn nhóm quyền...</option>
                                                {roles && roles.map((role) => (
                                                    <option key={role.manhomquyen} value={role.manhomquyen}>{role.tennhomquyen}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Mật khẩu {modalMode === 'edit' && '(Để trống nếu không đổi)'}</label>
                                            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleChange} required={modalMode === 'add'} />
                                        </div>
                                        <div className="mb-3 d-flex align-items-center gap-3">
                                            <label className="form-label">Trạng thái</label>
                                            <div className="form-check form-switch">
                                                <input className="form-check-input" type="checkbox" checked={formData.trangthai == 1} onChange={handleSwitchChange} />
                                                <label className="form-check-label">{formData.trangthai == 1 ? 'Hoạt động' : 'Bị khóa'}</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="block-content block-content-full text-end">
                                        <button type="button" className="btn btn-sm btn-alt-secondary me-1" onClick={() => setShowModal(false)}>Đóng</button>
                                        <button type="submit" className="btn btn-sm btn-primary">
                                            {modalMode === 'add' ? 'Lưu' : 'Cập nhật'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
