import confige from "../confige.json"
const API_BASE = confige.URL + 'api/food';

const api = {
  // متدهای موجود
  async getLabels() {
    const res = await fetch(`${API_BASE}/labels/`);
    return res.json();
  },
  
  async predictFood({ image, labelId, is_correct }) {
    const formData = new FormData();
    formData.append('image', image);
    // فقط اگر labelId مقدار معتبری داشت، آن را ارسال کن
    if (labelId && labelId !== '' && labelId !== 'undefined') {
      formData.append('correct_label', labelId);
    }
    if (is_correct !== undefined) {
      formData.append('is_correct', is_correct);
    } else {
      formData.append('is_correct', '');
    }
    const res = await fetch(`${API_BASE}/predict/`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },
  
  async getFeedbackList({ label, page, page_size } = {}) {
    let url = `${API_BASE}/feedback-list/?`;
    const params = [];
    if (label) params.push(`label=${label}`);
    if (page) params.push(`page=${page}`);
    if (page_size) params.push(`page_size=${page_size}`);
    url += params.join('&');
    const res = await fetch(url);
    return res.json();
  },
  
  async editFeedback({ id, image, labelId, token }) {
    const formData = new FormData();
    if (image) formData.append('image', image);
    if (labelId) formData.append('label_id', labelId);
    if (token) formData.append('token', token);
    const res = await fetch(`${API_BASE}/feedback/${id}/`, {
      method: 'PATCH',
      body: formData,
    });
    return res.json();
  },

  // متدهای جدید برای مدیریت لیبل‌ها
  async createLabel(labelData) {
    const data = { name: labelData.name };
    const res = await fetch(`${API_BASE}/labels/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('خطا در ایجاد لیبل');
    }
    return res.json();
  },

  async updateLabel(id, labelData) {
    const data = { name: labelData.name };
    const res = await fetch(`${API_BASE}/labels/${id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error('خطا در ویرایش لیبل');
    }
    return res.json();
  },

  async deleteLabel(labelId) {
    const res = await fetch(`${API_BASE}/labels/${labelId}/`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error('خطا در حذف لیبل');
    }
    return res.json();
  },

  // متد برای دریافت جزئیات یک فیدبک
  async getFeedbackDetail(id) {
    const res = await fetch(`${API_BASE}/feedback/${id}/`);
    if (!res.ok) {
      throw new Error('خطا در دریافت جزئیات فیدبک');
    }
    return res.json();
  },

  // متد جدید برای ارسال فیدبک تعاملی
  async submitFeedback({ image, predictedLabel, correctLabel, isCorrect }) {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('predicted_label', predictedLabel);
    if (isCorrect !== undefined && isCorrect !== null) {
      formData.append('is_correct', isCorrect);
    } else {
      formData.append('is_correct', '');
    }
    if (!isCorrect && correctLabel) {
      formData.append('correct_label', correctLabel);
    }
    
    const res = await fetch(`${API_BASE}/submit-feedback/`, {
      method: 'POST',
      body: formData,
    });
    
    if (!res.ok) {
      throw new Error('خطا در ارسال فیدبک');
    }
    
    return res.json();
  },

  // متد برای آموزش مجدد مدل
  async retrainModel() {
    const res = await fetch(`${API_BASE}/retrain/`, {
      method: 'POST',
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'خطا در آموزش مجدد مدل');
    }
    
    return res.json();
  },

  async deleteFeedback({ id, token }) {
    const res = await fetch(`${API_BASE}/feedback/${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    if (!res.ok && res.status !== 204) {
      const data = await res.json();
      throw new Error(data.error || 'خطا در حذف فیدبک');
    }
    return res.status === 204 ? { message: 'Feedback deleted successfully.' } : await res.json();
  },

  async getSystemStats() {
    const res = await fetch(`${API_BASE}/system-stats/`);
    return res.json();
  },

  async addFoodSample({ image, labelId }) {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('label_id', labelId);
    const res = await fetch(`${API_BASE}/add/`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('خطا در افزودن نمونه');
    return res.json();
  },
};

export default api; 