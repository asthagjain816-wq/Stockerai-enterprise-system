import socket
import threading
import customtkinter as ctk
from tkinter import simpledialog
from datetime import datetime
import winsound

# ---------------- THEME ----------------

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ---------------- WINDOW ----------------

window = ctk.CTk()

window.title("💬 Chat Application")
window.geometry("1450x900")

window.minsize(

    1200,

    750
)

# ---------------- LOGIN WINDOW ----------------

username = ""

# ---------------- CURRENT CHAT ----------------

selected_user = "🌐 Group Chat"
# -------- CHAT HISTORY --------

chat_history = {}

chat_history["🌐 Group Chat"] = []
user_cards = {}

login = ctk.CTkToplevel()

login.title("Login")

login.geometry("420x350")

login.resizable(False, False)

login.grab_set()

title = ctk.CTkLabel(

    login,

    text="💬 Chat Application",

    font=("Segoe UI",30,"bold")

)

title.pack(pady=(30,10))

subtitle = ctk.CTkLabel(

    login,

    text="Welcome!\nEnter your username",

    font=("Segoe UI",15)

)

subtitle.pack()

username_entry = ctk.CTkEntry(

    login,

    width=260,

    height=45,

    placeholder_text="Username"

)

username_entry.pack(pady=25)

def connect_user():

    global username

    username = username_entry.get().strip()

    if username == "":

        return

    login.destroy()

connect_btn = ctk.CTkButton(

    login,

    text="Connect",

    width=180,

    height=45,

    corner_radius=20,

    command=connect_user

)

connect_btn.pack(pady=15)

username_entry.focus()

window.wait_window(login)
# ---------------- SOCKET ----------------

host = "10.106.224.87"
port = 5000

client = socket.socket(
    socket.AF_INET,
    socket.SOCK_STREAM
)

try:

    client.connect((host, port))

except:

    print(" Could not connect to server")
    exit()

# ---------------- HEADER ----------------

header_frame = ctk.CTkFrame(
    window,
    height=80,
    corner_radius=25,
    fg_color="#111827"
)

header_frame.pack(
    fill="x",
    padx=20,
    pady=(15, 10)
)

# Left Side -----------------------------

left_frame = ctk.CTkFrame(
    header_frame,
    fg_color="transparent"
)

left_frame.pack(
    side="left",
    padx=20,
    pady=15
)

title_label = ctk.CTkLabel(
    left_frame,
    text="💬 Chat Application",
    font=("Segoe UI", 28, "bold")
)

title_label.pack(anchor="w")

subtitle = ctk.CTkLabel(
    left_frame,
    text="Fast • Secure • TCP/IP Socket Chat",
    font=("Segoe UI", 12),
    text_color="gray"
)

subtitle.pack(anchor="w")

# Center -----------------------------

center_frame = ctk.CTkFrame(
    header_frame,
    fg_color="transparent"
)

center_frame.pack(
    side="left",
    expand=True
)

user_label = ctk.CTkLabel(
    center_frame,
    text=f"👤 {username}",
    font=("Segoe UI", 16, "bold")
)

user_label.pack()

online_label = ctk.CTkLabel(
    center_frame,
    text="🟢 Connected",
    font=("Segoe UI", 13),
    text_color="#22C55E"
)

online_label.pack()

# Right -----------------------------

right_frame = ctk.CTkFrame(
    header_frame,
    fg_color="transparent"
)

right_frame.pack(
    side="right",
    padx=20
)

clock_label = ctk.CTkLabel(
    right_frame,
    text="",
    font=("Segoe UI", 16)
)

clock_label.pack()


current_chat_label = ctk.CTkLabel(
    window,
    text="💬 Chat : 🌐 Group Chat",
    font=("Segoe UI", 15, "bold"),
    text_color="#60A5FA"
)

current_chat_label.pack(pady=(0,10))


# ---------------- THEME ----------------

theme_mode = "dark"

def toggle_theme():

    global theme_mode

    if theme_mode == "dark":

        ctk.set_appearance_mode("light")

        theme_mode = "light"

        theme_button.configure(text="🌙")

    else:

        ctk.set_appearance_mode("dark")

        theme_mode = "dark"

        theme_button.configure(text="☀")

theme_button = ctk.CTkButton(
    right_frame,
    text="☀",
    width=45,
    height=35,
    command=toggle_theme
)

theme_button.pack(
    pady=8
)

# ---------------- CLOCK ----------------

def update_clock():

    current = datetime.now().strftime("%I:%M:%S %p")

    clock_label.configure(text=current)

    window.after(
        1000,
        update_clock
    )

update_clock()


# ---------------- MAIN AREA ----------------
top_buttons = ctk.CTkFrame(
    window,
    fg_color="transparent"
)

top_buttons.pack(
    fill="x",
    padx=20
)
def export_chat():

    with open(
        "chat_history.txt",
        "w",
        encoding="utf-8"
    ) as file:

        for widget in chat_frame.winfo_children():

            pass

export_btn = ctk.CTkButton(
    top_buttons,
    text="📄 Export"
)

export_btn.pack(
    side="right",
    padx=5
)
main_frame = ctk.CTkFrame(window)

main_frame.pack(
    fill="both",
    expand=True,
    padx=20,
    pady=10
)

# CHAT PANEL

chat_frame = ctk.CTkScrollableFrame(
    main_frame,
    fg_color="#111827",
    corner_radius=20
)

chat_frame.pack(
    side="left",
    fill="both",
    expand=True,
    padx=(0, 10)
)

def clear_chat():

    for widget in chat_frame.winfo_children():

        widget.destroy()

clear_btn = ctk.CTkButton(
    top_buttons,
    text="🗑 Clear",
    command=clear_chat
)

clear_btn.pack(
    side="right",
    padx=5
)

# ================= USERS PANEL =================

users_panel = ctk.CTkFrame(
    main_frame,
    width=280,
    corner_radius=20,
    fg_color="#1E293B"
)

users_panel.pack(
    side="right",
    fill="y",
    padx=(10,0)
)

users_panel.pack_propagate(False)

# ---------- TITLE ----------

users_title = ctk.CTkLabel(
    users_panel,
    text="👥 Online Users",
    font=("Segoe UI",20,"bold")
)

users_title.pack(
    pady=(18,10)
)

# ---------- SEARCH ----------

search_entry = ctk.CTkEntry(
    users_panel,
    placeholder_text="🔍 Search user...",
    height=38
)

search_entry.pack(
    fill="x",
    padx=15,
    pady=(0,12)
)

# ---------- USER LIST ----------

users_frame = ctk.CTkScrollableFrame(
    users_panel,
    fg_color="transparent"
)

users_frame.pack(
    fill="both",
    expand=True,
    padx=10
)

# ---------- STATS ----------

stats_frame = ctk.CTkFrame(
    users_panel,
    corner_radius=15,
    fg_color="#111827"
)

stats_frame.pack(
    fill="x",
    padx=12,
    pady=12
)

stats_title = ctk.CTkLabel(
    stats_frame,
    text="📊 Chat Statistics",
    font=("Segoe UI",16,"bold")
)

stats_title.pack(pady=(10,5))

online_count = ctk.CTkLabel(
    stats_frame,
    text="👥 Online : 0",
    font=("Segoe UI",14)
)

online_count.pack()

message_count = ctk.CTkLabel(
    stats_frame,
    text="💬 Messages : 0",
    font=("Segoe UI",14)
)

message_count.pack(pady=3)

status_card = ctk.CTkLabel(
    stats_frame,
    text="🟢 Server Connected",
    text_color="#22C55E",
    font=("Segoe UI",13)
)

status_card.pack(
    pady=(3,10)
)

# ---------------- MESSAGE BUBBLE ----------------

total_messages = 0
current_users = []
all_messages = []


def add_message(message, own=False):

    global total_messages

    total_messages += 1

    all_messages.append(message)

    try:
        message_count.configure(
            text=f"💬 Messages : {total_messages}"
        )
    except:
        pass

    current_time = datetime.now().strftime("%I:%M %p")

    # ---------------- SYSTEM MESSAGE ----------------

    if "joined the chat" in message or \
       "left the chat" in message:

        system = ctk.CTkLabel(
            chat_frame,
            text=message,
            font=("Segoe UI",13,"italic"),
            text_color="#60A5FA"
        )

        system.pack(
            pady=12
        )

        return

    # ---------------- USERNAME ----------------

    sender = ""

    text = message

    if ":" in message:

        sender, text = message.split(":",1)

    # ---------------- BUBBLE ----------------
    private = message.startswith("🔒")
    bubble = ctk.CTkFrame(
        chat_frame,
        fg_color="#8B5CF6" if private else (
            "#2563EB" if own else "#303030"
        ),
        corner_radius=20
    )
    bubble.pack(

        anchor="e" if own else "w",

        padx=15,

        pady=8

    )
    # ---------------- NAME ----------------

    if sender != "":

        sender_label = ctk.CTkLabel(

        bubble,

        text=sender,

        font=("Segoe UI",12,"bold"),

        text_color="#93C5FD"

    )

    sender_label.pack(

        anchor="w",

        padx=18,

        pady=(8,0)

    )

# ---------------- MESSAGE ----------------

    message_label = ctk.CTkLabel(

        bubble,

        text=text.strip(),

        wraplength=700,

        justify="left",

        font=("Segoe UI",15)

    )

    message_label.pack(

        anchor="w",

        padx=12,

        pady=(2,4)

    )

# ---------------- TIME ----------------

    time_label = ctk.CTkLabel(

        bubble,

        text=current_time,

        font=("Segoe UI",10),

        text_color="gray"

    )

    time_label.pack(

        anchor="e",

        padx=12,

        pady=(0,8)

    )

# ---------------- AUTO SCROLL ----------------

window.update_idletasks()

try:

    chat_frame._parent_canvas.yview_moveto(1.0)

except:

    pass

def select_user(user):

    global selected_user

    selected_user = user

    refresh_chat()

    current_chat_label.configure(
        text=f"💬 Chat : {user}"
    )

    for name, card in user_cards.items():

        if name == user:

            card.configure(
                fg_color="#2563EB"
            )

        else:

            card.configure(
                fg_color="#374151"
            )
user_cards = {}

def add_user(name):

    card = ctk.CTkFrame(
        users_frame,
        height=60,
        fg_color="#374151",
        corner_radius=12
    )

    card.pack(
        fill="x",
        pady=5,
        padx=5
    )

    avatar = ctk.CTkLabel(
        card,
        text=name[0].upper(),
        width=35,
        height=35,
        corner_radius=18,
        fg_color="#2563EB"
    )

    avatar.pack(
        side="left",
        padx=10,
        pady=10
    )

    label = ctk.CTkLabel(
        card,
        text=name,
        font=("Segoe UI",14,"bold")
    )

    label.pack(
        side="left"
    )

    user_cards[name] = card

    card.bind(
        "<Button-1>",
        lambda e, user=name: select_user(user)
    )

    avatar.bind(
        "<Button-1>",
        lambda e, user=name: select_user(user)
    )

    label.bind(
        "<Button-1>",
        lambda e, user=name: select_user(user)
    )
# ---------------- RECEIVE ----------------
def update_users(user_list):

    for widget in users_frame.winfo_children():
        widget.destroy()

    count = 0

    keyword = search_entry.get().lower()

    add_user("🌐 Group Chat")

    for user in user_list:

        if user.strip() == "":
            continue

        if keyword in user.lower():

            add_user(user)

            count += 1

    online_count.configure(
        text=f"👥 Online : {count}"
    )
search_entry.bind(
    "<KeyRelease>",
    lambda e: update_users(current_users)
)

# ---------------- RECEIVE ----------------

def receive_messages():

    while True:

        try:

            message = client.recv(1024).decode()

            if not message:
                break

            if message == "USERNAME":

                client.send(username.encode())

            elif message.startswith("USERS:"):

                users = message.replace("USERS:", "").split(",")

                window.after(
                    0,
                    lambda u=users: update_users(u)
                )

            else:

                if not message.startswith(f"{username}:"):

                    winsound.MessageBeep()

                    window.after(
                        0,
                        lambda m=message: add_message(m, False)
                    )

        except:

            break

    # Window may already be closed
    try:

        window.after(
            0,
            lambda: online_label.configure(
                text="🔴 Disconnected"
            )
        )

    except:

        pass
# ---------------- SEND ----------------

def send_message():

    message = message_entry.get().strip()

    if message == "":
        return

    # -------- GROUP OR PRIVATE --------

    if selected_user == "🌐 Group Chat":

        full_message = f"GROUP:{username}:{message}"

        display_message = f"{username}: {message}"

    else:

        full_message = f"PRIVATE:{username}:{selected_user}:{message}"

        display_message = f"🔒 To {selected_user}: {message}"

    try:

        client.send(full_message.encode())

        if selected_user not in chat_history:

            chat_history[selected_user] = []

        chat_history[selected_user].append(
            (display_message, True)
        )

        refresh_chat()

        # Update message count if you have this label
        try:
            global total_messages
            total_messages += 1
            message_count.configure(
                text=f"💬 Messages : {total_messages}"
            )
        except:
            pass

        message_entry.delete(
            0,
            "end"
        )

    except:

        add_message(
            "❌ Message not sent",
            False
        )

def refresh_chat():

    for widget in chat_frame.winfo_children():
        widget.destroy()

    if selected_user not in chat_history:
        return

    for msg, own in chat_history[selected_user]:

        add_message(msg, own)
# ---------------- BOTTOM FRAME ----------------

bottom_frame = ctk.CTkFrame(
    window,
    height=80,
    corner_radius=20,
    fg_color="#1C1C1C"
)

bottom_frame.pack(
    side="bottom",
    fill="x",
    padx=20,
    pady=20
)

# ---------------- ENTRY ----------------

message_entry = ctk.CTkEntry(
    bottom_frame,
    placeholder_text="Type your message...",
    height=50,
    corner_radius=20,
    font=("Segoe UI", 16)
)

message_entry.pack(
    side="left",
    fill="x",
    expand=True,
    padx=(15, 10),
    pady=15
)

# ---------------- BUTTON ----------------

send_button = ctk.CTkButton(
    bottom_frame,
    text="🚀 Send",
    width=130,
    height=50,
    fg_color="#2563EB",
    hover_color="#1D4ED8",
    corner_radius=20,
    font=("Segoe UI", 16, "bold"),
    command=send_message
)

send_button.pack(
    side="right",
    padx=(0, 15),
    pady=15
)


def open_emoji():

    popup = ctk.CTkToplevel(window)

    popup.title("Emoji")

    popup.geometry("320x170")

    emojis = [

        "😀","😂","😍","😎",

        "😭","👍","🔥","❤️",

        "🎉","👏","🤖","💻"

    ]

    row = 0
    col = 0

    for emoji in emojis:

        btn = ctk.CTkButton(

            popup,

            text=emoji,

            width=45,

            command=lambda e=emoji:
            (
                message_entry.insert("end",e),
                popup.destroy()
            )

        )

        btn.grid(

            row=row,

            column=col,

            padx=6,

            pady=6

        )

        col += 1

        if col == 4:

            row += 1

            col = 0
# ---------------- ENTER KEY ----------------

message_entry.bind(
    "<Return>",
    lambda event:
    [send_message(), "break"]
)

message_entry.focus()

# ---------------- THREAD ----------------

thread = threading.Thread(
    target=receive_messages,
    daemon=True
)

thread.start()
# ---------------- MAIN LOOP ----------------
def on_closing():

    try:
        client.close()
    except:
        pass

    window.destroy()

window.protocol(
    "WM_DELETE_WINDOW",
    on_closing
)
window.mainloop()