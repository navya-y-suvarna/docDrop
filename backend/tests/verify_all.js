const fs = require("fs");
const path = require("path");
const assert = require("assert");

async function runTests() {
  console.log("🧪 Starting DocDrop Backend Verification Suite...");
  const PORT = 5001; // Run on test port
  process.env.PORT = PORT;
  
  const app = require("../server");
  
  // Wait a moment for server to listen
  await new Promise((resolve) => setTimeout(resolve, 800));

  const BASE = `http://localhost:${PORT}/api`;

  try {
    // 1. Health check
    console.log("➡️ Test 1: Health check");
    const healthRes = await fetch(`${BASE}/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, "OK");
    console.log("✅ Health check passed");

    // 2. Authentication: Login demo user
    console.log("➡️ Test 2: Auth login");
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "demo@docdrop.com",
        password: "Demo@123",
      }),
    });
    const loginData = await loginRes.json();
    assert.ok(loginData.token, "Login should return JWT token");
    const token = loginData.token;
    console.log("✅ Demo login passed, received token");

    // 3. User Me Profile
    console.log("➡️ Test 3: Get profile (/auth/me)");
    const meRes = await fetch(`${BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meData = await meRes.json();
    assert.strictEqual(meData.user.email, "demo@docdrop.com");
    console.log("✅ Profile verification passed");

    // 4. File Upload (Multipart Form Data)
    console.log("➡️ Test 4: File upload");
    const dummyFilePath = path.join(__dirname, "test_doc.txt");
    fs.writeFileSync(dummyFilePath, "Hello, DocDrop! This is a secure document upload test.");

    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(dummyFilePath)], { type: "text/plain" });
    formData.append("file", fileBlob, "test_doc.txt");
    formData.append("description", "Automated test document");
    formData.append("tags", JSON.stringify(["test", "pbl", "demo"]));

    const uploadRes = await fetch(`${BASE}/files/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const uploadData = await uploadRes.json();
    assert.ok(uploadData.file && uploadData.file.id, "Upload should return created file");
    const fileId = uploadData.file.id;
    console.log(`✅ File upload passed, fileId: ${fileId}`);

    // 5. List Files & Search
    console.log("➡️ Test 5: List & Search files");
    const listRes = await fetch(`${BASE}/files?search=test_doc`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listRes.json();
    assert.ok(listData.files.length > 0, "List files should find uploaded file");
    console.log(`✅ File search passed, found ${listData.files.length} document(s)`);

    // 6. View File Stream
    console.log("➡️ Test 6: View file inline stream");
    const viewRes = await fetch(`${BASE}/files/${fileId}/view`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const viewText = await viewRes.text();
    assert.strictEqual(viewText, "Hello, DocDrop! This is a secure document upload test.");
    console.log("✅ File inline view stream passed");

    // 7. Create Password-Protected Share Link
    console.log("➡️ Test 7: Create password-protected share link");
    const shareRes = await fetch(`${BASE}/files/${fileId}/share`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: "SecretPassword123",
        expires_in_hours: 24,
        max_downloads: 10,
        allow_download: true,
      }),
    });
    const shareData = await shareRes.json();
    assert.ok(shareData.share && shareData.share.share_token, "Share link should return token");
    const shareToken = shareData.share.share_token;
    console.log(`✅ Share link created: token ${shareToken}`);

    // 8. Public Share Access (Password Required)
    console.log("➡️ Test 8: Public share info endpoint");
    const publicInfoRes = await fetch(`${BASE}/shares/public/${shareToken}`);
    const publicInfo = await publicInfoRes.json();
    assert.strictEqual(publicInfo.has_password, true);
    assert.strictEqual(publicInfo.original_name, "test_doc.txt");
    console.log("✅ Public share metadata retrieval passed");

    // 9. Verify Share Password
    console.log("➡️ Test 9: Verify share password");
    const verifyPassRes = await fetch(`${BASE}/shares/public/${shareToken}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: "SecretPassword123" }),
    });
    const verifyPassData = await verifyPassRes.json();
    assert.strictEqual(verifyPassData.verified, true);
    assert.ok(verifyPassData.shareAccessToken, "Should receive share session token");
    const shareAccessToken = verifyPassData.shareAccessToken;
    console.log("✅ Share password verification passed");

    // 10. Public Stream with Session Token
    console.log("➡️ Test 10: Public download stream");
    const pubDownloadRes = await fetch(`${BASE}/shares/public/${shareToken}/download`, {
      headers: { "x-share-token": shareAccessToken },
    });
    const pubDownloadContent = await pubDownloadRes.text();
    assert.strictEqual(pubDownloadContent, "Hello, DocDrop! This is a secure document upload test.");
    console.log("✅ Public download stream passed");

    // 11. Create Print Order
    console.log("➡️ Test 11: Create print drop order");
    const orderRes = await fetch(`${BASE}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file_id: fileId,
        copies: 2,
        color_mode: "bw",
        paper_size: "A4",
        double_sided: true,
        binding_type: "staple",
        total_pages: 5,
        notes: "Please staple in top left corner",
      }),
    });
    const orderData = await orderRes.json();
    assert.ok(orderData.order && orderData.order.order_number);
    assert.ok(orderData.order.pickup_code);
    assert.ok(orderData.order.pickup_qr);
    const orderId = orderData.order.id;
    const pickupCode = orderData.order.pickup_code;
    console.log(`✅ Print order created: #${orderData.order.order_number}, pickup code: ${pickupCode}`);

    // 12. Process Simulated Payment
    console.log("➡️ Test 12: Process order payment");
    const payRes = await fetch(`${BASE}/payments/process`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: orderId,
        payment_method: "upi",
      }),
    });
    const payData = await payRes.json();
    assert.ok(payData.payment && payData.payment.transaction_id);
    console.log(`✅ Payment processed: Txn ${payData.payment.transaction_id}`);

    // 13. Admin queue and Pickup verification
    console.log("➡️ Test 13: Admin queue & Pickup verification");
    const adminLoginRes = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@docdrop.com",
        password: "Admin@123",
      }),
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.token;

    const queueRes = await fetch(`${BASE}/orders/admin/queue`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const queueData = await queueRes.json();
    assert.ok(queueData.orders.length > 0);

    const verifyPickupRes = await fetch(`${BASE}/orders/admin/verify-pickup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: pickupCode }),
    });
    const verifyPickupData = await verifyPickupRes.json();
    assert.strictEqual(verifyPickupData.verified, true);
    console.log("✅ Admin queue & pickup verification passed");

    // Cleanup test dummy file
    if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);

    console.log("\n🎉 ALL 13 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test failure:", err);
    process.exit(1);
  }
}

runTests();
