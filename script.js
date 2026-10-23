let user = { username: "", baseGrade: 1, level: 1, xp: 0, streak: 0, badges: [] };
let currentQuizGrade = 1;
let currentCorrectIndex = 0; 
let oldLevel = 1;

const availableBadges = [
    "Wira Sifir ⚔️", "Pakar Geometri 📐", "Sifu KSSR 🎓", "Raja Matematik 👑", 
    "Penakluk Pecahan 🍰", "Pahlawan Wang 💰", "Penjelajah Masa ⏳", "Juara Statistik 📊"
];

window.onload = function() {
    const savedData = localStorage.getItem('mathQuest_kssr_obj_user');
    if (savedData) {
        user = JSON.parse(savedData);
        if(!user.badges) user.badges = [];
        oldLevel = user.level;
        updateStatsUI(); 
        showPage('menuPage');
    } else { 
        showPage('authPage'); 
    }
};

function showPage(pageId) {
    document.getElementById('authPage').style.display = pageId === 'authPage' ? 'block' : 'none';
    document.getElementById('menuPage').style.display = pageId === 'menuPage' ? 'block' : 'none';
    document.getElementById('quizPage').style.display = pageId === 'quizPage' ? 'block' : 'none';
    document.getElementById('statusTopBar').style.display = pageId === 'authPage' ? 'none' : 'flex';
    if(pageId === 'menuPage') displayBadgesInMenu();
}

function registerUser() {
    const name = document.getElementById('usernameInput').value.trim();
    const grade = document.getElementById('gradeSelect').value;
    if (name === "") { alert("Sila isi nama samaran!"); return; }
    user = { username: name, baseGrade: parseInt(grade), level: 1, xp: 0, streak: 0, badges: [] };
    oldLevel = 1;
    saveData(); updateStatsUI(); showPage('menuPage');
}

function saveData() { localStorage.setItem('mathQuest_kssr_obj_user', JSON.stringify(user)); }

function updateStatsUI() {
    let calculatedLevel = Math.floor(user.xp / 100) + 1;
    if (calculatedLevel > user.level && user.xp > 0) {
        user.level = calculatedLevel;
        saveData();
        triggerTreasureChest(calculatedLevel);
    } else {
        user.level = calculatedLevel;
    }

    document.getElementById('barUsername').innerText = user.username;
    document.getElementById('barGrade').innerText = "D" + user.baseGrade;
    document.getElementById('barLevel').innerText = user.level;
    document.getElementById('barXP').innerText = user.xp;
    document.getElementById('barStreak').innerText = user.streak;
    
    if(user.badges.length > 0) {
        document.getElementById('badgeDisplay').innerText = "Lencana: " + user.badges[user.badges.length - 1];
    } else {
        document.getElementById('badgeDisplay').innerText = "Lencana: Tiada";
    }
    saveData();
}

function displayBadgesInMenu() {
    if(user.badges && user.badges.length > 0) {
        document.getElementById('collectedBadgesBox').style.display = 'block';
        document.getElementById('badgesText').innerText = user.badges.join(', ');
    } else {
        document.getElementById('collectedBadgesBox').style.display = 'none';
    }
}

function triggerTreasureChest(newLevel) {
    document.getElementById('newLevelText').innerText = newLevel;
    document.getElementById('chestIcon').innerText = "📦";
    document.getElementById('chestRewardText').innerText = "";
    document.getElementById('closeChestBtn').style.display = "none";
    document.getElementById('chestOverlay').style.display = "flex";
}

function openChest() {
    if (document.getElementById('chestIcon').innerText === "🔓") return;
    document.getElementById('chestIcon').innerText = "🔓";
    
    let unearned = availableBadges.filter(b => !user.badges.includes(b));
    let prizeBadge = unearned.length > 0 ? unearned[Math.floor(Math.random() * unearned.length)] : "Permata Infiniti 💎";
    
    if(!user.badges.includes(prizeBadge) && prizeBadge !== "Permata Infiniti 💎") {
        user.badges.push(prizeBadge);
    }

    let bonusXp = Math.floor(Math.random() * 41) + 10;
    user.xp += bonusXp;
    document.getElementById('chestRewardText').innerHTML = `Ganjaran:<br><span style="color:#f1c40f; font-size:1.3rem;">\${prizeBadge}</span><br><span style="color:#2ecc71;">+\${bonusXp} XP Bonus!</span>`;
    document.getElementById('closeChestBtn').style.display = "block";
    saveData();
}

function closeChest() {
    document.getElementById('chestOverlay').style.display = "none";
    updateStatsUI();
}

function startQuiz(grade) {
    currentQuizGrade = grade;
    document.getElementById('quizTitle').innerText = "Cabaran Darjah " + grade;
    generateSyllabusQuestion();
    showPage('quizPage');
}

function generateSyllabusQuestion() {
    document.getElementById('feedbackText').className = "feedback";
    document.getElementById('feedbackText').innerText = "";
    document.getElementById('nextBtn').style.display = "none";
    enableOptionButtons(true);

    let qText = ""; let topic = ""; let correctAns = ""; let wrongAnswers = [];
    let roll = Math.floor(Math.random() * 4);

    if (currentQuizGrade === 1) {
        if (roll === 0) {
            topic = "Nombor Bulat: Nilai Tempat";
            let n = Math.floor(Math.random() * 80) + 10;
            let sa = n % 10;
            let puluh = Math.floor(n / 10);
            let checkSa = Math.random() > 0.5;
            qText = `Apakah nilai tempat bagi digit \${checkSa ? sa : puluh} dalam nombor \${n}?`;
            correctAns = checkSa ? "sa" : "puluh";
            wrongAnswers = ["ratus", "ribu", "ratus ribu"];
        } else if (roll === 1) {
            topic = "Pecahan Asas";
            qText = "Sebiji pizza dipotong kepada dua bahagian yang sama besar. Satu bahagian ialah...";
            correctAns = "separuh"; wrongAnswers = ["suku", "tiga perempat", "keseluruhan"];
        } else if (roll === 2) {
            topic = "Wang: Tambah Sen";
            let w1 = Math.floor(Math.random() * 30) + 10;
            let w2 = Math.floor(Math.random() * 30) + 5;
            qText = `Kira jumlah wang ini: \${w1} sen + \${w2} sen = ?`;
            correctAns = `\${w1 + w2} sen`;
            wrongAnswers = [`\${w1 + w2 + 10} sen`, `\${w1 + w2 - 5} sen`, `\${w1 + w2 + 4} sen`];
        } else {
            topic = "Operasi Asas: Tambah Mudah";
            let n1 = Math.floor(Math.random() * 9) + 1;
            let n2 = Math.floor(Math.random() * 9) + 1;
            qText = `Berapakah \${n1} + \${n2}?`;
            correctAns = (n1 + n2).toString();
            wrongAnswers = [(n1+n2+2).toString(), (n1+n2-1).toString(), (n1+n2+1).toString()];
        }
    } 
    else if (currentQuizGrade === 2) {
        if (roll === 0) {
            topic = "Nombor Bulat: Cerakinan";
            let p = (Math.floor(Math.random() * 5) + 1) * 100;
            let pul = (Math.floor(Math.random() * 5) + 1) * 10;
            let s = Math.floor(Math.random() * 9) + 1;
            qText = `Cerakin digit bagi \${p + pul + s} ialah \${p} + [ ? ] + \${s}.`;
            correctAns = pul.toString(); wrongAnswers = [(pul/10).toString(), (pul*10).toString(), "0"];
        } else if (roll === 1) {
            topic = "Operasi Asas: Darab";
            let s = Math.floor(Math.random() * 4) + 2;
            let m = Math.floor(Math.random() * 8) + 2;
            qText = `Selesaikan: \${s} × \${m} = ?`;
            correctAns = (s * m).toString();
            wrongAnswers = [(s*m+s).toString(), (s*m-1).toString(), (s*m+2).toString()];
        } else {
            topic = "Masa dan Waktu";
            let jam = Math.floor(Math.random() * 10) + 1;
            qText = `Jarum pendek pada angka \${jam} dan jarum panjang tepat pada angka 12. Pukul berapakah itu?`;
            correctAns = `Pukul \${jam}:00`;
            wrongAnswers = [`Pukul \${jam}:30`, `Pukul 12:\${jam}`, "Pukul 12:00"];
        }
    }
    else if (currentQuizGrade === 3) {
        if (roll === 0) {
            topic = "Pecahan Setara";
            qText = "Pecahan manakah yang setara dengan 1/2?";
            correctAns = "2/4"; wrongAnswers = ["1/3", "2/3", "3/5"];
        } else if (roll === 1) {
            topic = "Wang: Tukar Nilai RM";
            let rm = Math.floor(Math.random() * 5) + 2;
            qText = `Tukarkan RM\${rm} kepada bentuk unit sen.`;
            correctAns = `\${rm * 100} sen`; wrongAnswers = [`\${rm * 10} sen`, `\${rm}0 sen`, `\${rm * 1000} sen`];
        } else {
            topic = "Ukuran Panjang: m ke cm";
            let m = Math.floor(Math.random() * 8) + 1;
            qText = `Sebuah meja berukuran \${m} meter panjang. Tukar kepada unit cm.`;
            correctAns = `\${m * 100} cm`; wrongAnswers = [`\${m * 10} cm`, `\${m}0 cm`, `\${m * 1000} cm`];
        }
    }
    else if (currentQuizGrade === 4) {
        if (roll === 0) {
            topic = "Nombor Bulat: Bundar";
            let ribu = (Math.floor(Math.random() * 5) + 1) * 1000;
            let n = ribu + Math.floor(Math.random() * 300) + 50;
            qText = `Bundarkan nombor \${n} kepada ribu yang terdekat.`;
            correctAns = ribu.toString(); wrongAnswers = [(ribu+1000).toString(), (ribu-1000).toString(), (ribu+500).toString()];
        } else if (roll === 1) {
            topic = "Peratusan";
            let p = (Math.floor(Math.random() * 8) + 1) * 10;
            qText = `Tukarkan pecahan \${p}/100 kepada bentuk simbol peratus.`;
            correctAns = `\${p}%`; wrongAnswers = [`0.\${p}%`, `\${p}0%`, `\${p/10}%`];
        } else {
            topic = "Ruang: Perimeter";
            let p = Math.floor(Math.random() * 4) + 5;
            let l = Math.floor(Math.random() * 2) + 2;
            qText = `Cari perimeter sebuah segi empat tepat dengan panjang \${p}cm dan lebar \${l}cm.`;
            correctAns = `\${(p*2)+(l*2)} cm`; wrongAnswers = [`\${p*l} cm`, `\${p+l} cm`, `\${p*2+l} cm`];
        }
    }
    else if (currentQuizGrade === 5) {
        if (roll === 0) {
            topic = "Operasi Bergabung";
            let a = Math.floor(Math.random() * 8) + 10;
            let b = Math.floor(Math.random() * 4) + 2;
            let c = Math.floor(Math.random() * 4) + 1;
            qText = `Hitung mengikut tertib BODMAS: \${a} + \${b} × \${c} = ?`;
            correctAns = (a + (b * c)).toString(); wrongAnswers = [((a+b)*c).toString(), (a+b+c).toString(), (a-(b*c)).toString()];
        } else if (roll === 1) {
            topic = "Perpuluhan: Pendaraban";
            let d = (Math.random() * 3 + 1).toFixed(2);
            qText = `Berapakah hasil bagi nilai \${d} × 100?`;
            correctAns = (parseFloat(d) * 100).toFixed(0); wrongAnswers = [(parseFloat(d)*10).toFixed(1), "100", "0"];
        } else {
            topic = "Jisim: Penukaran kg ke g";
            let kg = Math.floor(Math.random() * 4) + 2;
            qText = `Tukarkan \${kg} kg 500 g kepada satu unit gram (g) sahaja.`;
            correctAns = `\${(kg * 1000) + 500} g`; wrongAnswers = [`\${kg}500 g`, `\${kg * 100 + 500} g`, `\${kg}000 g`];
        }
    }
    else {
        if (roll === 0) {
            topic = "Nisbah KSSR";
            let n = Math.floor(Math.random() * 3) + 2;
            qText = `Nisbah pensel kepada pemadam ialah 1:2. Jika terdapat \${n} pensel, berapakah bilangan pemadam?`;
            correctAns = (n * 2).toString(); wrongAnswers = [n.toString(), (n+2).toString(), (n*3).toString()];
        } else if (roll === 1) {
            topic = "Kebolehjadian";
            qText = "Apakah kebolehjadian sebiji guli hitam keluar dari kotak yang hanya mempunyai guli hitam?";
            correctAns = "pasti"; wrongAnswers = ["mustahil", "sama kemungkinan", "kecil kemungkinan"];
        } else {
            topic = "Statistik: Mod";
            let m = Math.floor(Math.random() * 4) + 3;
            qText = `Apakah nilai 'Mod' bagi set data skor ini: \${m}, 2, 8, \${m}, 5, \${m}, 9?`;
            correctAns = m.toString(); wrongAnswers = ["2", "8", "9"];
        }
    }

    document.getElementById('topicText').innerText = "Topik: " + topic;
    document.getElementById('questionText').innerText = qText;

    let allOptions = [correctAns, ...wrongAnswers];
    for (let i = allOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
    }

    currentCorrectIndex = allOptions.indexOf(correctAns);

    document.getElementById('optA').innerText = "A) " + allOptions[0];
    document.getElementById('optB').innerText = "B) " + allOptions[1];
    document.getElementById('optC').innerText = "C) " + allOptions[2];
    document.getElementById('optD').innerText = "D) " + allOptions[3];
}

function enableOptionButtons(enable) {
    const btns = ['optA', 'optB', 'optC', 'optD'];
    btns.forEach(id => {
        document.getElementById(id).disabled = !enable;
        if(enable) {
            document.getElementById(id).style.background = "#ffffff";
            document.getElementById(id).style.borderColor = "#ddd";
        }
    });
}

function checkAnswer(selectedIndex) {
    enableOptionButtons(false);
    const feedback = document.getElementById('feedbackText');
    const btnIds = ['optA', 'optB', 'optC', 'optD'];

    if (selectedIndex === currentCorrectIndex) {
        user.streak += 1;
        let xpGained = (currentQuizGrade * 10) + (user.streak > 3 ? 10 : 0);
        user.xp += xpGained;
        document.getElementById(btnIds[selectedIndex]).style.background = "#2ecc71";
        document.getElementById(btnIds[selectedIndex]).style.borderColor = "#2ecc71";
        feedback.className = "feedback success";
        feedback.innerText = `Tepat Sekali! 🎉 (+ \${xpGained} XP)`;
    } else {
        user.streak = 0;
        document.getElementById(btnIds[selectedIndex]).style.background = "#e74c3c";
        document.getElementById(btnIds[selectedIndex]).style.borderColor = "#e74c3c";
        document.getElementById(btnIds[currentCorrectIndex]).style.background = "#2ecc71";
        document.getElementById(btnIds[currentCorrectIndex]).style.borderColor = "#2ecc71";
        feedback.className = "feedback error";
        feedback.innerText = `Kurang tepat!`;
    }

    updateStatsUI();
    document.getElementById('nextBtn').style.display = "block";
}

function goBackMenu() { showPage('menuPage'); }

function resetGame() {
    if (confirm("Adakah anda pasti mahu memadam profil dan set semula semua skor/XP ke 0?")) {
        localStorage.removeItem('mathQuest_kssr_obj_user');
        document.getElementById('usernameInput').value = "";
        showPage('authPage');
    }
}