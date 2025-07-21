# Git Commit Genius

Tự động tạo thông điệp commit chất lượng cao bằng AI và git diff.

## Tổng quan

Git Commit Genius là một công cụ dòng lệnh giúp lập trình viên tạo ra các thông điệp commit có ý nghĩa và nhất quán bằng cách phân tích git diff và sử dụng AI (Ollama) để tạo thông điệp commit phù hợp. Nó hợp lý hóa quy trình commit và đảm bảo việc ghi chép các thay đổi mã nguồn một cách chất lượng.

## Tính năng

- 🤖 **Phân tích tự động**: Phân tích các thay đổi đã staged trong kho git
- 🧠 **AI tạo thông điệp**: Sử dụng Ollama để tạo thông điệp commit chất lượng cao
- 📝 **Hỗ trợ Conventional Commits**: Tuân thủ chuẩn Conventional Commits (type(scope): message)
- 🌍 **Đa ngôn ngữ**: Hỗ trợ nhiều ngôn ngữ (Tiếng Anh, Tây Ban Nha, Pháp, Đức)
- 🪝 **Tích hợp Git hooks**: Cài đặt như một git hook để tự động hóa quá trình commit
- ⚙️ **Cấu hình tùy chỉnh**: Lưu trữ và quản lý cấu hình người dùng

## Yêu cầu

- [Node.js](https://nodejs.org/) (v14 trở lên)
- [Git](https://git-scm.com/)
- [Ollama](https://ollama.ai/) chạy ở local và đã cài đặt các model

## Cài đặt

### Cài đặt từ mã nguồn

```bash
# Clone kho lưu trữ
git clone https://github.com/yourusername/git-commit-genius.git

# Di chuyển đến thư mục dự án
cd git-commit-genius

# Cài đặt các dependencies
npm install

# Liên kết gói toàn cục
npm link
```

### Cài đặt toàn cục (sau khi xuất bản)

```bash
npm install -g git-commit-genius
```

## Cách sử dụng

```bash
# Sử dụng cơ bản - tạo thông điệp commit cho các thay đổi đã staged
git add .
git-commit-genius generate

# Sử dụng một model Ollama cụ thể
git-commit-genius generate --model codellama

# Điều chỉnh nhiệt độ (mức độ ngẫu nhiên) của quá trình tạo
git-commit-genius generate --temperature 0.5

# Tạo và tự động commit
git-commit-genius generate --commit

# Xem trước diff mà không tạo thông điệp
git-commit-genius generate --preview

# Tạo thông điệp commit theo chuẩn conventional
git-commit-genius generate --conventional

# Tạo thông điệp commit bằng tiếng Tây Ban Nha
git-commit-genius generate --language es
```

## Các tùy chọn

### Lệnh generate

| Tùy chọn | Mô tả |
|----------|-------|
| `-m, --model <model>` | Model Ollama sử dụng để tạo thông điệp (mặc định: llama2) |
| `-t, --temperature <temperature>` | Nhiệt độ cho quá trình tạo (0.0-1.0) |
| `-c, --commit` | Tự động commit với thông điệp đã tạo |
| `-p, --preview` | Chỉ xem trước sự thay đổi mà không tạo thông điệp |
| `-v, --conventional` | Sử dụng định dạng conventional commit |
| `-l, --language <language>` | Ngôn ngữ cho thông điệp commit (en, es, fr, de) |
| `--type <type>` | Loại conventional commit (feat, fix, docs, ...) |
| `--scope <scope>` | Phạm vi cho conventional commit |

### Lệnh config

| Tùy chọn | Mô tả |
|----------|-------|
| `-s, --set <key=value>` | Đặt giá trị cấu hình |
| `-g, --get <key>` | Lấy giá trị cấu hình |
| `-l, --list` | Liệt kê tất cả giá trị cấu hình |
| `-r, --reset` | Đặt lại cấu hình về mặc định |

### Lệnh hook

| Tùy chọn | Mô tả |
|----------|-------|
| `-i, --install` | Cài đặt Git hooks |
| `-r, --remove` | Gỡ bỏ Git hooks |

## Tích hợp vào Quy trình làm việc

Git Commit Genius được thiết kế để hòa nhập liền mạch vào quy trình phát triển của bạn:

1. Thực hiện các thay đổi mã nguồn
2. Stage các thay đổi bằng `git add`
3. Chạy `git-commit-genius generate`
4. Xem xét thông điệp commit được tạo
5. Tùy chọn chỉnh sửa thông điệp
6. Commit các thay đổi

## Cấu trúc dự án

### Các file chính

- **bin/index.js**: Điểm vào chính của ứng dụng, đăng ký các lệnh
- **src/commands/generate.js**: Lệnh tạo thông điệp commit
- **src/commands/config.js**: Lệnh quản lý cấu hình
- **src/commands/hook.js**: Lệnh quản lý Git hooks
- **src/utils/git.js**: Tiện ích thao tác với Git
- **src/utils/ollama.js**: Tiện ích tương tác với Ollama API
- **src/utils/conventional-commits.js**: Xử lý định dạng conventional commits
- **src/config/config.js**: Quản lý cấu hình người dùng
- **src/hooks/hook-manager.js**: Quản lý cài đặt/gỡ bỏ Git hooks
- **src/locales/**: Thư mục chứa các file ngôn ngữ (en.json, es.json, ...)

## Chi tiết kỹ thuật

### src/utils/git.js

File này chứa các hàm tiện ích để tương tác với Git:
- `isGitRepository()`: Kiểm tra xem thư mục hiện tại có phải là Git repository
- `getStagedDiff()`: Lấy diff của các thay đổi đã staged
- `getStagedFiles()`: Lấy danh sách các file đã staged
- `hasStagedChanges()`: Kiểm tra xem có thay đổi nào đã staged chưa
- `commit(message)`: Thực hiện commit với thông điệp được cung cấp

### src/utils/ollama.js

File này xử lý việc tương tác với Ollama API:
- `isAvailable()`: Kiểm tra xem Ollama có sẵn sàng không
- `getAvailableModels()`: Lấy danh sách các model có sẵn từ Ollama
- `generateCommitMessage(diff, model, temperature, language)`: Tạo thông điệp commit dựa trên diff và các tham số được cung cấp

### src/utils/conventional-commits.js

File này xử lý định dạng conventional commits:
- `formatCommitMessage(message, type, scope)`: Định dạng thông điệp theo chuẩn conventional commits
- `getCommitTypes()`: Lấy danh sách các loại conventional commit

### src/config/config.js

File này quản lý cấu hình người dùng:
- `getConfig()`: Lấy cấu hình hiện tại
- `setConfigValue(key, value)`: Đặt giá trị cấu hình
- `getConfigValue(key)`: Lấy giá trị cấu hình theo key
- `resetConfig()`: Đặt lại cấu hình về mặc định

### src/hooks/hook-manager.js

File này quản lý Git hooks:
- `installHooks()`: Cài đặt Git hooks
- `removeHooks()`: Gỡ bỏ Git hooks
- `completeHook(success, message)`: Hoàn thành quá trình hook

### src/locales/language-manager.js

File này quản lý hệ thống đa ngôn ngữ:
- `get(key, args, language)`: Lấy chuỗi đã dịch theo key và ngôn ngữ
- `getAvailableLanguages()`: Lấy danh sách các ngôn ngữ có sẵn

## Giấy phép

ISC
