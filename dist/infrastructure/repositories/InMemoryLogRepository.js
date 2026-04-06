"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryLogRepository = void 0;
class InMemoryLogRepository {
    logs = new Map();
    async save(file) {
        this.logs.set(file.id, file);
        return file;
    }
    async findById(id) {
        return this.logs.get(id) || null;
    }
    async findAll() {
        return Array.from(this.logs.values());
    }
    async delete(id) {
        this.logs.delete(id);
    }
}
exports.InMemoryLogRepository = InMemoryLogRepository;
//# sourceMappingURL=InMemoryLogRepository.js.map