// ------------------ Utility Functions ------------------

function getStudents() {
    return JSON.parse(localStorage.getItem('students')) || [];
}

function saveStudents(students) {
    localStorage.setItem('students', JSON.stringify(students));
}

function getBooks() {
    return JSON.parse(localStorage.getItem('books')) || [];
}

function saveBooks(books) {
    localStorage.setItem('books', JSON.stringify(books));
}

// ------------------ Core Functions ------------------

// Add Student
function addStudent() {
    const name = document.getElementById("studentName").value;
    const id = document.getElementById("studentID").value;
    const year = document.getElementById("studentYear").value;

    if(!name || !id) { alert("Please enter valid student details!"); return; }

    const students = getStudents();
    if(students.some(s => s.id === id)) { alert("Student ID already exists!"); return; }

    students.push({ id, name, year, borrowedBooks: [] });
    saveStudents(students);
    alert(`Student ${name} added!`);
    document.getElementById("studentName").value = '';
    document.getElementById("studentID").value = '';
}

// Add Book
function addBook() {
    const title = document.getElementById("bookTitle").value;
    const id = document.getElementById("bookID").value;
    const subject = document.getElementById("bookSubject").value;

    if(!title || !id || !subject) { alert("Please enter valid book details!"); return; }

    const books = getBooks();
    if(books.some(b => b.id === id)) { alert("Book ID already exists!"); return; }

    books.push({ id, title, subject, isBorrowed: false });
    saveBooks(books);
    alert(`Book '${title}' added!`);
    document.getElementById("bookTitle").value = '';
    document.getElementById("bookID").value = '';
    document.getElementById("bookSubject").value = '';
}

// Borrow Book
function borrowBook() {
    const studentID = document.getElementById("borrowStudentID").value;
    const bookID = document.getElementById("borrowBookID").value;

    const students = getStudents();
    const books = getBooks();

    const student = students.find(s => s.id === studentID);
    const book = books.find(b => b.id === bookID);

    if(!student) { alert("Student not found"); return; }
    if(!book) { alert("Book not found"); return; }
    if(book.isBorrowed) { alert("Book already borrowed"); return; }

    // Borrow date and deadline
    const borrowDate = new Date();
    const deadline = new Date();
    deadline.setDate(borrowDate.getDate() + 7); // 7-day deadline

    student.borrowedBooks.push({
        bookID: book.id,
        borrowDate: borrowDate.toISOString(),
        deadline: deadline.toISOString()
    });

    book.isBorrowed = true;

    saveStudents(students);
    saveBooks(books);

    alert(`${student.name} borrowed '${book.title}'. Deadline: ${deadline.toDateString()}`);
}

// Return Book with penalty
function returnBook() {
    const studentID = document.getElementById("returnStudentID").value;
    const bookID = document.getElementById("returnBookID").value;

    const students = getStudents();
    const books = getBooks();

    const student = students.find(s => s.id === studentID);
    const book = books.find(b => b.id === bookID);

    if(!student) { alert("Student not found"); return; }
    if(!book) { alert("Book not found"); return; }

    const borrowed = student.borrowedBooks.find(b => b.bookID === bookID);
    if(!borrowed) { alert("This student didn't borrow this book"); return; }

    const today = new Date();
    const deadline = new Date(borrowed.deadline);

    let penalty = 0;
    if(today > deadline) {
        const diffTime = today - deadline;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        penalty = diffDays * 10; // 10 units/day late
    }

    // Remove borrowed book
    student.borrowedBooks = student.borrowedBooks.filter(b => b.bookID !== bookID);
    book.isBorrowed = false;

    saveStudents(students);
    saveBooks(books);

    if(penalty > 0) {
        alert(`${student.name} returned '${book.title}' late! Penalty: ₹${penalty}`);
    } else {
        alert(`${student.name} returned '${book.title}' on time.`);
    }
}

// List Students by Year
function listStudentsByYear() {
    const students = getStudents();
    const output = students.reduce((acc, s) => {
        acc[s.year] = acc[s.year] || [];
        acc[s.year].push(`${s.id}: ${s.name} (Borrowed: ${s.borrowedBooks.length})`);
        return acc;
    }, {});

    let text = '';
    for (let year in output) {
        text += `Year ${year}:\n${output[year].join('\n')}\n\n`;
    }
    document.getElementById("output").innerText = text;
}

// List Books by Subject
function listBooksBySubject() {
    const books = getBooks();
    const output = books.reduce((acc, b) => {
        acc[b.subject] = acc[b.subject] || [];
        const status = b.isBorrowed ? "Borrowed" : "Available";
        acc[b.subject].push(`${b.id}: ${b.title} (${status})`);
        return acc;
    }, {});

    let text = '';
    for (let subject in output) {
        text += `Subject: ${subject}\n${output[subject].join('\n')}\n\n`;
    }
    document.getElementById("output").innerText = text;
}
