# Git Commit Genius - Hướng dẫn Thiết lập và Kiểm thử

Hướng dẫn này cung cấp các bước để thiết lập môi trường cần thiết và kiểm thử các tính năng cơ bản của Git Commit Genius.

## Yêu cầu cài đặt

### 1. Cài đặt Node.js

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (sử dụng Homebrew)
brew install node

# Windows
# Tải và cài đặt từ https://nodejs.org/en/download/
```

Xác minh cài đặt:
```bash
node --version  # Nên hiển thị v18.x hoặc cao hơn
npm --version   # Nên hiển thị 8.x hoặc cao hơn
```

### 2. Cài đặt Git

```bash
# Ubuntu/Debian
sudo apt-get install git

# macOS
brew install git

# Windows
# Tải và cài đặt từ https://git-scm.com/download/win
```

Xác minh cài đặt:
```bash
git --version  # Nên hiển thị 2.x hoặc cao hơn
```

### 3. Cài đặt Ollama

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# Tải từ https://ollama.com/download
```

Khởi động dịch vụ Ollama:
```bash
# macOS/Linux
ollama serve

# Windows
# Chạy ứng dụng Ollama
```

### 4. Cài đặt Model ngôn ngữ

```bash
# Cài đặt model nhỏ để bắt đầu
ollama pull llama2  # ~4GB

# Model nhỏ hơn (lựa chọn thay thế)
ollama pull mistral  # ~4GB
```

Xác minh Ollama đang chạy với các model đã cài đặt:
```bash
ollama list  # Nên hiển thị các model đã cài đặt
curl http://localhost:11434/api/tags  # Nên trả về JSON với các model
```

### 5. Cài đặt Git Commit Genius

```bash
# Clone repository
git clone https://github.com/HoanNguyenUET/git-commit-genius.git
cd git-commit-genius

# Cài đặt các dependencies
npm install

# Liên kết package để sử dụng toàn cục
npm link
```

## Kiểm thử tính năng cơ bản

### Kiểm thử 1: Xác minh cài đặt

```bash
# Kiểm tra nếu git-commit-genius khả dụng
git-commit-genius --version
```

Kết quả mong đợi: Hiển thị thông tin phiên bản

### Kiểm thử 2: Tạo repository kiểm thử

```bash
# Tạo thư mục kiểm thử
mkdir gcg-test
cd gcg-test
git init

# Tạo một số file kiểm thử
echo "# Test Project" > README.md
echo "console.log('Hello world');" > index.js

# Commit ban đầu
git add .
git commit -m "Initial commit"
```

### Kiểm thử 3: Tạo thông điệp commit cơ bản

```bash
# Thực hiện thay đổi để kiểm thử
echo "// Hàm mới" >> index.js
echo "function test() { return true; }" >> index.js

# Stage các thay đổi
git add index.js

# Tạo thông điệp commit
git-commit-genius generate
```

Kết quả mong đợi:
- Danh sách các file đã stage
- Xác nhận rằng Ollama khả dụng
- Thông điệp commit được tạo
- Các tùy chọn để commit, chỉnh sửa, tạo lại hoặc hủy

### Kiểm thử 4: Kiểm thử tùy chọn Commit

Sau khi chạy lệnh generate và thấy thông điệp được tạo:
- Chọn "Use this message and commit"

Kết quả mong đợi:
- Xác nhận rằng các thay đổi đã được commit
- Kiểm tra với `git log -1` để xem commit mới của bạn

### Kiểm thử 5: Kiểm thử tính năng xem trước

```bash
# Thực hiện thay đổi khác
echo "const VERSION = '1.0.0';" >> index.js
git add index.js

# Sử dụng tùy chọn xem trước
git-commit-genius generate --preview
```

Kết quả mong đợi:
- Nên hiển thị git diff mà không tạo thông điệp commit

### Kiểm thử 6: Kiểm thử ngôn ngữ tiếng Việt

```bash
# Thực hiện thay đổi khác
echo "// Kiểm tra tiếng Việt" >> index.js
git add index.js

# Tạo bằng tiếng Việt
git-commit-genius generate --language vi
```

Kết quả mong đợi:
- Văn bản giao diện nên hiển thị bằng tiếng Việt
- Thông điệp commit được tạo nên bằng tiếng Việt

### Kiểm thử 7: Kiểm thử Conventional Commits

```bash
# Thêm một file mới
echo "body { margin: 0; }" > styles.css
git add styles.css

# Tạo với định dạng conventional
git-commit-genius generate --conventional
```

Kết quả mong đợi:
- Thông điệp được tạo nên tuân theo định dạng conventional (ví dụ: "feat: Add styles.css with basic CSS")

### Kiểm thử 8: Kiểm thử tính năng Commit trực tiếp

```bash
# Thêm thay đổi khác
echo "* { box-sizing: border-box; }" >> styles.css
git add styles.css

# Tạo và commit trực tiếp
git-commit-genius generate --commit
```

Kết quả mong đợi:
- Công cụ nên tạo thông điệp và commit ngay lập tức
- Kiểm tra với `git log -1` để xem commit của bạn

### Kiểm thử 9: Kiểm thử cấu hình

```bash
# Xem cấu hình hiện tại
git-commit-genius config

# Đặt model mặc định
git-commit-genius config --set model.defaultModel=llama2

# Đặt ngôn ngữ mặc định là tiếng Việt
git-commit-genius config --set language.defaultLanguage=vi

# Kiểm tra rằng cấu hình hoạt động
git-commit-genius generate
```

Kết quả mong đợi:
- Các cài đặt mặc định nên được áp dụng (ngôn ngữ tiếng Việt)
- Đặt lại cấu hình khi hoàn thành:
```bash
git-commit-genius config --reset
```

## Xử lý vấn đề thường gặp

### 1. Vấn đề kết nối Ollama

Nếu bạn thấy lỗi "Ollama is not available":
```bash
# Kiểm tra nếu Ollama đang chạy
curl http://localhost:11434/api/tags

# Nếu không chạy, khởi động nó
ollama serve
```

### 2. Vấn đề không tìm thấy Model

Nếu bạn thấy lỗi về model không khả dụng:
```bash
# Liệt kê các model đã cài đặt
ollama list

# Cài đặt model nếu cần
ollama pull llama2
```

### 3. Vấn đề Git

Nếu các thao tác Git thất bại:
```bash
# Kiểm tra nếu bạn đang ở trong một repository git
git status

# Kiểm tra nếu bạn có thay đổi đã staged
git diff --staged
```

### 4. Vấn đề Node.js/NPM

Nếu bạn gặp lỗi JavaScript:
```bash
# Đảm bảo tất cả dependencies được cài đặt
npm install

# Kiểm tra phiên bản Node.js tương thích
node --version # Nên là v14.x hoặc cao hơn
```

### 5. Vấn đề Model cụ thể (codellama)

Nếu bạn gặp lỗi "model 'codellama' not found":
```bash
# Sử dụng một model đã cài đặt
git-commit-genius generate --model llama2

# Hoặc cài đặt model codellama
ollama pull codellama
```

## Bước tiếp theo

Sau khi xác minh các tính năng cơ bản hoạt động chính xác, bạn có thể khám phá các tính năng nâng cao hơn:

- Tích hợp Git hooks (`git-commit-genius hook --install`)
- Cài đặt nhiệt độ tùy chỉnh (`--temperature` option)
- Các model Ollama khác nhau (thử với các model khác)

Để biết thêm về các tùy chọn chi tiết, chạy:
```bash
git-commit-genius --help
git-commit-genius generate --help
```

## Tắt công cụ Git Commit Genius

Để tắt hoặc ngừng sử dụng công cụ Git Commit Genius:

### 1. Ngừng sử dụng tạm thời

Đơn giản là không sử dụng lệnh `git-commit-genius` và quay lại các lệnh Git thông thường:

```bash
# Thay vì sử dụng git-commit-genius generate
git commit -m "Thông điệp commit của bạn"
```

### 2. Hủy liên kết lệnh toàn cục

```bash
# Điều hướng đến thư mục git-commit-genius
cd /path/to/git-commit-genius

# Hủy liên kết package
npm unlink

# Hoặc hủy liên kết toàn cục từ bất kỳ đâu
npm unlink -g git-commit-genius
```

### 3. Gỡ bỏ Git hooks (nếu đã cài đặt)

```bash
# Sử dụng lệnh tích hợp
git-commit-genius hook --remove

# Hoặc gỡ bỏ hook thủ công
rm -f .git/hooks/prepare-commit-msg
```

### 4. Dừng dịch vụ Ollama

```bash
# Trên Linux/macOS
pkill ollama

# Hoặc nếu bạn khởi động với 'ollama serve'
# Nhấn Ctrl+C trong terminal đang chạy nó
```
