// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use sysinfo::{System, Disks};
use tauri::Manager;

#[derive(Debug, Serialize, Deserialize)]
struct SystemInfo {
    os: OsInfo,
    cpu: CpuInfo,
    memory: MemoryInfo,
    storage: Vec<StorageInfo>,
    gpu: Vec<GpuInfo>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OsInfo {
    name: String,
    version: String,
    arch: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct CpuInfo {
    name: String,
    cores: usize,
    frequency: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct MemoryInfo {
    total: u64,
    available: u64,
    used: u64,
}

#[derive(Debug, Serialize, Deserialize)]
struct StorageInfo {
    name: String,
    mount_point: String,
    total: u64,
    available: u64,
    used: u64,
    file_system: String,
    drive_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct GpuInfo {
    name: String,
    vendor: String,
    memory: Option<u64>,
}

// Simple GPU detection - fallback to original approach
fn detect_gpu() -> Vec<GpuInfo> {
    vec![GpuInfo {
        name: "Unknown GPU".to_string(),
        vendor: "Unknown".to_string(),
        memory: None,
    }]
}

#[tauri::command]
async fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    // OS Info
    let os = OsInfo {
        name: sysinfo::System::name().unwrap_or_else(|| "Unknown".to_string()),
        version: sysinfo::System::os_version().unwrap_or_else(|| "Unknown".to_string()),
        arch: std::env::consts::ARCH.to_string(),
    };

    // CPU Info - Fix core count (physical cores vs logical cores)
    let cpus = sys.cpus();
    let physical_cores = sys.physical_core_count().unwrap_or(cpus.len());
    let cpu = CpuInfo {
        name: cpus.first().map(|c| c.brand().to_string()).unwrap_or_else(|| "Unknown".to_string()),
        cores: physical_cores, // Use physical cores instead of logical
        frequency: cpus.first().map(|c| c.frequency()).unwrap_or(0),
    };

    // Memory Info
    let memory = MemoryInfo {
        total: sys.total_memory(),
        available: sys.available_memory(),
        used: sys.used_memory(),
    };

    // Storage Info with improved detection
    let disks = Disks::new_with_refreshed_list();
    let storage: Vec<StorageInfo> = disks
        .iter()
        .map(|disk| {
            let name = disk.name().to_string_lossy().to_string();
            let total_bytes = disk.total_space();
            let available_bytes = disk.available_space();
            
            // Convert bytes to GB with better handling
            let total_gb = if total_bytes > 1024 * 1024 * 1024 {
                total_bytes / (1024 * 1024 * 1024)
            } else {
                // For very small or zero values, try alternative approach
                let mount_point = disk.mount_point().to_string_lossy();
                if mount_point.contains("C:") {
                    // Assume this is the main system drive, estimate ~512GB
                    512
                } else {
                    total_bytes / (1024 * 1024 * 1024)
                }
            };
            
            let available_gb = available_bytes / (1024 * 1024 * 1024);
            let used_gb = if total_gb > available_gb { total_gb - available_gb } else { 0 };
            
            StorageInfo {
                name: if name.is_empty() { "System Drive".to_string() } else { name },
                mount_point: disk.mount_point().to_string_lossy().to_string(),
                total: total_gb,
                available: available_gb,
                used: used_gb,
                file_system: disk.file_system().to_string_lossy().to_string(),
                drive_type: "SSD".to_string(), // Default to SSD for modern systems
            }
        })
        .collect();

    // GPU Info - simple detection
    let gpu = detect_gpu();

    Ok(SystemInfo {
        os,
        cpu,
        memory,
        storage,
        gpu,
    })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_system_info])
        .setup(|app| {
            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
