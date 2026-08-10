// Zero-Trace Client-Side Encrypted Storage Vault & Panic Wipe Engine

export function panicWipeAllData() {
  localStorage.clear();
  sessionStorage.clear();

  // Clear all cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });

  window.location.reload();
}

export function exportVaultBackup() {
  const backup = {
    username: localStorage.getItem("connect_username") || "",
    friendKey: localStorage.getItem("connect_friend_key") || "",
    friends: JSON.parse(localStorage.getItem("connect_friends_list") || "[]"),
    savedRooms: JSON.parse(localStorage.getItem("connect_saved_public_rooms") || "[]"),
    exportedAt: new Date().toISOString()
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `connect-vault-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
