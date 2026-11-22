export default function HomePage() {
  return (
    <main style={{ maxWidth: 640, margin: "64px auto", padding: 24, background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <h1 style={{ marginTop: 0, color: "#00506e" }}>خادم تطبيق إدارة المهام</h1>
      <p>الخدمة تعمل وجاهزة لاستقبال طلبات المزامنة السحابية عبر حساب Google وقاعدة بيانات PostgreSQL.</p>
      <ul style={{ lineHeight: 1.9 }}>
        <li><code>GET /api/health</code> — فحص حالة الخادم وقاعدة البيانات</li>
        <li><code>POST /api/auth/google</code> — تسجيل الدخول والتحقق من حساب Google</li>
        <li><code>GET / POST /api/tasks</code> — جلب وإضافة مهام المستخدم المعزولة</li>
        <li><code>PUT / DELETE /api/tasks/:id</code> — تعديل وحذف مهمة</li>
        <li><code>DELETE /api/tasks/completed</code> — مسح المهام المكتملة</li>
      </ul>
    </main>
  );
}
