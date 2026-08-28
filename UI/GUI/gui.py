import customtkinter as ctk
import requests
from datetime import datetime

# API Configuration
API_BASE_URL = "http://127.0.0.1:8000"

# Set the tactical UI theme
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("dark-blue")

class TacticalInterface(ctk.CTk):
    def __init__(self):
        super().__init__()

        self.title("ECOSYS // Execution Terminal")
        self.geometry("800x600")

        # Grid Layout Configuration
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # --- LEFT SIDEBAR (Navigation) ---
        self.sidebar_frame = ctk.CTkFrame(self, width=200, corner_radius=0)
        self.sidebar_frame.grid(row=0, column=0, sticky="nsew")
        self.sidebar_frame.grid_rowconfigure(4, weight=1)

        self.logo_label = ctk.CTkLabel(self.sidebar_frame, text="CORE // ECOSYS", font=ctk.CTkFont(size=20, weight="bold"))
        self.logo_label.grid(row=0, column=0, padx=20, pady=(20, 10))

        self.btn_due_today = ctk.CTkButton(self.sidebar_frame, text="Due Today", command=self.load_due_today)
        self.btn_due_today.grid(row=1, column=0, padx=20, pady=10)

        self.btn_overdue = ctk.CTkButton(self.sidebar_frame, text="Overdue", fg_color="#8B0000", hover_color="#5c0000", command=self.load_overdue)
        self.btn_overdue.grid(row=2, column=0, padx=20, pady=10)

        # --- MAIN CONTENT AREA ---
        self.main_frame = ctk.CTkFrame(self)
        self.main_frame.grid(row=0, column=1, sticky="nsew", padx=20, pady=20)
        self.main_frame.grid_rowconfigure(1, weight=1)
        self.main_frame.grid_columnconfigure(0, weight=1)

        # Top Bar: Add Task Input
        self.add_task_frame = ctk.CTkFrame(self.main_frame, fg_color="transparent")
        self.add_task_frame.grid(row=0, column=0, sticky="ew", pady=(0, 20))
        self.add_task_frame.grid_columnconfigure(0, weight=1)

        self.entry_task = ctk.CTkEntry(self.add_task_frame, placeholder_text="Initialize new task...")
        self.entry_task.grid(row=0, column=0, sticky="ew", padx=(0, 10))

        self.btn_add = ctk.CTkButton(self.add_task_frame, text="Execute", width=100, command=self.create_task)
        self.btn_add.grid(row=0, column=1)

        # Task Display Area (Scrollable)
        self.task_list_frame = ctk.CTkScrollableFrame(self.main_frame, label_text="Active Grid")
        self.task_list_frame.grid(row=1, column=0, sticky="nsew")

        # Load initial data (if server is running)
        self.load_due_today()

    # --- API INTEGRATION METHODS ---

    def create_task(self):
        title = self.entry_task.get()
        if not title:
            return
        
        # Payload for the FastAPI backend
        payload = {"title": title, "state": "Backlog"}
        try:
            response = requests.post(f"{API_BASE_URL}/tasks/", json=payload)
            if response.status_code == 200:
                self.entry_task.delete(0, 'end')
                self.load_due_today() # Refresh the view
        except requests.exceptions.ConnectionError:
            self.display_error("API Offline. Check FastAPI Server.")

    def load_due_today(self):
        self.fetch_and_display("/tasks/due_today", "Tasks: Due Today")

    def load_overdue(self):
        self.fetch_and_display("/tasks/overdue", "Tasks: OVERDUE")

    def fetch_and_display(self, endpoint, title):
        self.task_list_frame.configure(label_text=title)
        
        # Clear existing UI elements
        for widget in self.task_list_frame.winfo_children():
            widget.destroy()

        try:
            response = requests.get(f"{API_BASE_URL}{endpoint}")
            if response.status_code == 200:
                tasks = response.json()
                for i, task in enumerate(tasks):
                    # Display each task as a label in the scrollable frame
                    task_text = f"[{task['state']}] {task['title']}"
                    lbl = ctk.CTkLabel(self.task_list_frame, text=task_text, anchor="w")
                    lbl.grid(row=i, column=0, sticky="ew", pady=5, padx=10)
            else:
                self.display_error("Failed to fetch data.")
        except requests.exceptions.ConnectionError:
            self.display_error("API Offline. Check FastAPI Server.")

    def display_error(self, message):
        lbl = ctk.CTkLabel(self.task_list_frame, text=message, text_color="red")
        lbl.grid(row=0, column=0, pady=10)

if __name__ == "__main__":
    app = TacticalInterface()
    app.mainloop()