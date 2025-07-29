use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Patient {
    pub id: String,
    pub patient_id: String,
    pub full_name: String,
    pub date_of_birth: String,
    pub gender: String,
    pub phone: String,
    pub email: Option<String>,
    pub status: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DashboardStats {
    pub total_patients: u32,
    pub active_admissions: u32,
    pub today_appointments: u32,
    pub pending_bills: u32,
    pub available_rooms: u32,
    pub occupancy_rate: u32,
}

#[tauri::command]
async fn get_patients() -> Result<Vec<Patient>, String> {
    // In a real application, this would connect to a database
    // For demo purposes, return mock data
    let patients = vec![
        Patient {
            id: "1".to_string(),
            patient_id: "HMS001".to_string(),
            full_name: "Sarah Johnson".to_string(),
            date_of_birth: "1985-03-15".to_string(),
            gender: "female".to_string(),
            phone: "+1234567890".to_string(),
            email: Some("sarah.johnson@email.com".to_string()),
            status: "admitted".to_string(),
            created_at: "2024-01-15T10:00:00Z".to_string(),
        },
        Patient {
            id: "2".to_string(),
            patient_id: "HMS002".to_string(),
            full_name: "Michael Chen".to_string(),
            date_of_birth: "1978-07-22".to_string(),
            gender: "male".to_string(),
            phone: "+1234567891".to_string(),
            email: Some("michael.chen@email.com".to_string()),
            status: "registered".to_string(),
            created_at: "2024-01-16T14:30:00Z".to_string(),
        },
    ];
    
    Ok(patients)
}

#[tauri::command]
async fn get_dashboard_stats() -> Result<DashboardStats, String> {
    // In a real application, this would calculate from database
    Ok(DashboardStats {
        total_patients: 1247,
        active_admissions: 34,
        today_appointments: 18,
        pending_bills: 7,
        available_rooms: 12,
        occupancy_rate: 75,
    })
}

#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}! Welcome to Hospital Management System.", name))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .invoke_handler(tauri::generate_handler![greet, get_patients, get_dashboard_stats])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
