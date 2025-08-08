// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use sysinfo::{System, SystemExt, ComponentExt, DiskExt, ProcessorExt};
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
}

#[derive(Debug, Serialize, Deserialize)]
struct GpuInfo {
    name: String,
    vendor: String,
    memory: Option<u64>,
}

#[tauri::command]
async fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    // OS Info
    let os = OsInfo {
        name: sys.name().unwrap_or_else(|| "Unknown".to_string()),
        version: sys.os_version().unwrap_or_else(|| "Unknown".to_string()),
        arch: std::env::consts::ARCH.to_string(),
    };

    // CPU Info
    let processors = sys.processors();
    let cpu = CpuInfo {
        name: processors.first().map(|p| p.brand().to_string()).unwrap_or_else(|| "Unknown".to_string()),
        cores: processors.len(),
        frequency: processors.first().map(|p| p.frequency()).unwrap_or(0),
    };

    // Memory Info
    let memory = MemoryInfo {
        total: sys.total_memory(),
        available: sys.available_memory(),
        used: sys.used_memory(),
    };

    // Storage Info
    let storage: Vec<StorageInfo> = sys.disks().iter().map(|disk| {
        StorageInfo {
            name: disk.name().to_string_lossy().to_string(),
            mount_point: disk.mount_point().to_string_lossy().to_string(),
            total: disk.total_space(),
            available: disk.available_space(),
            used: disk.total_space() - disk.available_space(),
            file_system: disk.file_system().to_string_lossy().to_string(),
        }
    }).collect();

    // GPU Info (placeholder - would need additional crate for detailed GPU info)
    let gpu = vec![GpuInfo {
        name: "Unknown GPU".to_string(),
        vendor: "Unknown".to_string(),
        memory: None,
    }];

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
