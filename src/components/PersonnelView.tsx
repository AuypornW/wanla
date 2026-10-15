import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  MapPin,
  Shield,
  Edit2,
  Trash2,
  FileSignature,
  CheckCircle2,
  X,
  Plus
} from 'lucide-react';
import { Personnel, RoleType } from '../types';
import { SignaturePad } from './SignaturePad';

interface PersonnelViewProps {
  personnelList: Personnel[];
  onSavePersonnel: (personnel: Partial<Personnel>) => Promise<boolean>;
  onDeletePersonnel: (id: string) => Promise<boolean>;
  currentUser: Personnel | null;
}

const ROLES: RoleType[] = [
  '1ครูผู้สอน / บุคลากรทั่วไป',
  '2หัวหน้าฝ่ายบริหารงานวิชาการ (ตรวจใบลา)',
  '3ผู้อำนวยการโรงเรียน (อนุมัติใบลา)',
  '4ผู้ดูแลระบบ'
];

const PREFIXES = ['นาย', 'นาง', 'นางสาว', 'ดร.', 'ว่าที่ร้อยตรี', 'ว่าที่ร้อยตรีหญิง'];

const POSITIONS = [
  'ผู้อำนวยการโรงเรียน',
  'รองผู้อำนวยการโรงเรียน',
  'ครู',
  'ครูผู้ช่วย',
  'พนักงานราชการ',
  'เจ้าหน้าที่ธุรการ',
  'นักการภารโรง'
];

const ACADEMIC_STANDINGS = [
  'ไม่มี',
  'ชำนาญการ',
  'ชำนาญการพิเศษ',
  'เชี่ยวชาญ',
  'เชี่ยวชาญพิเศษ'
];

export const PersonnelView: React.FC<PersonnelViewProps> = ({
  personnelList,
  onSavePersonnel,
  onDeletePersonnel
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);

  // Form State
  const [prefix, setPrefix] = useState('นาย');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [position, setPosition] = useState('ครู');
  const [academicStanding, setAcademicStanding] = useState('ชำนาญการ');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<RoleType>('1ครูผู้สอน / บุคลากรทั่วไป');
  const [signatureUrl, setSignatureUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openAddModal = () => {
    setEditingPersonnel(null);
    setPrefix('นาย');
    setFirstName('');
    setLastName('');
    setPosition('ครู');
    setAcademicStanding('ไม่มี');
    setPhone('');
    setAddress('โรงเรียนบ้านห้วยไคร้ ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย');
    setRole('1ครูผู้สอน / บุคลากรทั่วไป');
    setSignatureUrl('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Personnel) => {
    setEditingPersonnel(p);
    setPrefix(p.prefix);
    setFirstName(p.firstName);
    setLastName(p.lastName);
    setPosition(p.position);
    setAcademicStanding(p.academicStanding);
    setPhone(p.phone);
    setAddress(p.address);
    setRole(p.role);
    setSignatureUrl(p.signatureUrl || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('กรุณากรอกชื่อและนามสกุล');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('กรุณากรอกเบอร์โทรศัพท์');
      return;
    }

    setIsSaving(true);
    const payload: Partial<Personnel> = {
      ...(editingPersonnel ? { id: editingPersonnel.id } : {}),
      prefix,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      position,
      academicStanding,
      phone: phone.trim(),
      address: address.trim(),
      role,
      signatureUrl
    };

    const success = await onSavePersonnel(payload);
    setIsSaving(false);
    if (success) {
      setIsModalOpen(false);
    } else {
      setErrorMsg('ไม่สามารถบันทึกข้อมูลบุคลากรได้ กรุณาลองใหม่');
    }
  };

  const filtered = personnelList.filter(p => {
    const matchesSearch =
      p.firstName.includes(searchTerm) ||
      p.lastName.includes(searchTerm) ||
      p.position.includes(searchTerm) ||
      p.phone.includes(searchTerm);

    const matchesRole = roleFilter === 'all' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (r: string) => {
    if (r.includes('ผู้อำนวยการ')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">ผู้อำนวยการโรงเรียน (อนุมัติใบลา)</span>;
    }
    if (r.includes('วิชาการ')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">หัวหน้าฝ่ายวิชาการ (ตรวจใบลา)</span>;
    }
    if (r.includes('ดูแลระบบ')) {
      return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">ผู้ดูแลระบบ (Admin)</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">ครูผู้สอน / บุคลากรทั่วไป</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            การบริหารงานบุคคล
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            ข้อมูลข้าราชการครูและบุคลากร
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2 (บันทึกลายเซ็นเพื่อใช้ยื่นและอนุมัติใบลาอัตโนมัติ)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          เพิ่มข้อมูลบุคลากร
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, สกุล, ตำแหน่ง, เบอร์โทร..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">บทบาท:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">ทั้งหมด ({personnelList.length} คน)</option>
            {ROLES.map(r => (
              <option key={r} value={r}>{r.replace(/^\d/, '')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all p-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 font-bold flex items-center justify-center text-lg shadow-inner">
                    {person.firstName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">
                      {person.prefix}{person.firstName} {person.lastName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {person.position} {person.academicStanding !== 'ไม่มี' && `(${person.academicStanding})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(person)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                    title="แก้ไขข้อมูล"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`คุณต้องการลบข้อมูลของ ${person.prefix}${person.firstName} หรือไม่?`)) {
                        onDeletePersonnel(person.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="ลบข้อมูล"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                {getRoleBadge(person.role)}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{person.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate">{person.address}</span>
                </div>
              </div>
            </div>

            {/* Signature Preview & Leave Stats */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block">วันลาสะสมที่ใช้</span>
                <span className="font-bold text-slate-800 text-sm">
                  {person.leaveStats?.totalUsed || 0} วัน
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block mb-1">ลายเซ็นอิเล็กทรอนิกส์</span>
                {person.signatureUrl ? (
                  <div className="h-8 w-24 bg-slate-50 border border-slate-200 rounded-md p-1 flex items-center justify-center">
                    <img src={person.signatureUrl} alt="Signature" className="max-h-full object-contain" />
                  </div>
                ) : (
                  <span className="text-[11px] text-amber-600 font-medium">ยังไม่ได้บันทึก</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Personnel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">
                  {editingPersonnel ? 'แก้ไขข้อมูลบุคลากร' : 'เพิ่มข้อมูลบุคลากรใหม่'}
                </h3>
                <p className="text-xs text-slate-500">
                  โรงเรียนบ้านห้วยไคร้ สพป.สุโขทัย เขต 2
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">คำนำหน้าชื่อ *</label>
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ชื่อ *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="เช่น ชัชวาลย์"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">นามสกุล *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                    placeholder="เช่น ใจภักดี"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ตำแหน่ง *</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">วิทยฐานะ *</label>
                  <select
                    value={academicStanding}
                    onChange={(e) => setAcademicStanding(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white"
                  >
                    {ACADEMIC_STANDINGS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="เช่น 087-654-3210"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">บทบาทในระบบ * (4 ตัวเลือก)</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleType)}
                    className="w-full px-3 py-2 rounded-xl border border-blue-400 bg-blue-50/40 text-blue-900 font-semibold"
                  >
                    {ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ที่อยู่ *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="เช่น หมู่ที่ 4 ต.ห้วยไคร้ อ.ทุ่งเสลี่ยม จ.สุโขทัย"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              {/* ลายมือชื่ออิเล็กทรอนิกส์ประจำตัว */}
              <div className="pt-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  ภาพลายมือชื่ออิเล็กทรอนิกส์ประจำตัว
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  เพื่อนำมาใช้โดยอัตโนมัติตอนบันทึกและยื่นขอใบลา หรือตอนผู้บริหารอนุมัติ
                </p>
                <SignaturePad
                  initialSignature={signatureUrl}
                  savedProfileSignature={signatureUrl}
                  onSave={(dataUrl) => setSignatureUrl(dataUrl)}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer transition shadow-md disabled:opacity-50"
                >
                  {isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลบุคลากร'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
