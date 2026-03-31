
import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Shield, 
  IndianRupee, 
  Image as ImageIcon, 
  CheckCircle2, 
  Save, 
  RefreshCcw, 
  Mail, 
  Globe, 
  Lock, 
  BellRing, 
  CreditCard,
  Loader2
} from 'lucide-react';
import { apiService } from '../../services/apiService';

const ToggleSwitch: React.FC<{ 
  checked: boolean; 
  onChange: (val: boolean) => void;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}> = ({ checked, onChange, label, subLabel, disabled }) => {
  return (
    <label className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl cursor-pointer group/toggle border border-slate-100 hover:border-slate-200 transition-all">
      <div className="flex flex-col">
        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">{label}</span>
        {subLabel && <span className="text-[10px] text-slate-400 font-medium">{subLabel}</span>}
      </div>
      <div 
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${
          checked ? 'bg-slate-900' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </div>
    </label>
  );
};

const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState<any>({
    platformName: '',
    supportEmail: '',
    membershipFee: 0,
    referralCommission: 0,
    joiningFee: 0,
    paymentSettings: { gateway: 'Razorpay', currency: 'INR' },
    notificationSettings: { emailAlerts: true, browserAlerts: true },
    securitySettings: { twoFactorAuth: false, sessionTimeout: 60 },
    referralRules: { acceptanceTimeline: 48, minDealValue: 1000 }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await apiService.getPlatformSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAll = async () => {
    setUpdating(true);
    setSuccess(false);
    try {
      await apiService.updatePlatformSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update platform settings');
    } finally {
      setUpdating(false);
    }
  };

  const handleImmediateUpdate = async (category: 'security' | 'notification', key: string, value: any) => {
    // Optimistic Update
    const prevSettings = { ...settings };
    const updatedSettings = { ...settings };
    if (category === 'security') {
      updatedSettings.securitySettings = { ...updatedSettings.securitySettings, [key]: value };
    } else {
      updatedSettings.notificationSettings = { ...updatedSettings.notificationSettings, [key]: value };
    }
    setSettings(updatedSettings);

    try {
      if (category === 'security') {
        await apiService.updateSecuritySettings({ [key]: value });
      } else {
        await apiService.updateNotificationSettings({ [key]: value });
      }
    } catch (error) {
      console.error(`Error updating ${category} setting:`, error);
      setSettings(prevSettings); // Rollback
      alert('Failed to save setting change');
    }
  };

  const handleChange = (path: string, value: any) => {
    const keys = path.split('.');
    if (keys.length === 1) {
      setSettings({ ...settings, [path]: value });
    } else {
      const parent = keys[0];
      const child = keys[1];
      setSettings({
        ...settings,
        [parent]: { ...settings[parent], [child]: value }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-300">
        <RefreshCcw className="w-12 h-12 animate-spin mb-4" />
        <p className="font-black uppercase tracking-widest text-[10px]">Loading Core Configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-[1400px] mx-auto p-4 sm:p-6 md:p-8">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Platform Settings</h1>
          <p className="text-slate-500 font-medium text-sm px-2 md:px-0">Configure global rules, fees, and brand identity.</p>
        </div>
        <button 
          onClick={handleUpdateAll}
          disabled={updating}
          className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 ${
            success ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-slate-900 text-white shadow-slate-900/20 hover:scale-105 active:scale-95'
          }`}
        >
          {updating ? <RefreshCcw className="w-5 h-5 animate-spin" /> : success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          {success ? 'Settings Saved' : 'Update Global Identity'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* Economic Rules */}
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <h3 className="text-xl font-black text-slate-950 mb-10 flex items-center gap-3 relative z-10">
             <IndianRupee className="w-6 h-6 text-emerald-600" /> Economic Configuration
           </h3>
           <div className="space-y-8 relative z-10">
              {[
                { label: 'Membership Fee (Per Quarter)', key: 'membershipFee', hint: 'Auto-billed to members', type: 'number' },
                { label: 'Referral Commission (%)', key: 'referralCommission', hint: 'Platform share of closed deals', type: 'number' },
                { label: 'Joining Fee', key: 'joiningFee', hint: 'One-time registration cost', type: 'number' },
              ].map((setting, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-3 text-center md:text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{setting.label}</label>
                    <span className="text-[10px] text-slate-300 font-bold italic">{setting.hint}</span>
                  </div>
                  <div className="relative">
                    <input 
                      type={setting.type} 
                      value={settings[setting.key]}
                      onChange={(e) => handleChange(setting.key, parseFloat(e.target.value) || 0)}
                      className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-950 focus:ring-4 focus:ring-emerald-600/5 outline-none transition-all placeholder-slate-300"
                    />
                    {setting.key === 'referralCommission' && <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400">%</span>}
                    {setting.type === 'number' && setting.key !== 'referralCommission' && <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>}
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Branding & Identity */}
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <h3 className="text-xl font-black text-slate-950 mb-10 flex items-center gap-3 relative z-10">
             <ImageIcon className="w-6 h-6 text-indigo-600" /> Platform Identity
           </h3>
           <div className="space-y-8 relative z-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Platform Name</label>
                <div className="relative">
                   <Globe className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input 
                      type="text" 
                      value={settings.platformName}
                      onChange={(e) => handleChange('platformName', e.target.value)}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-950 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                   />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Support Email</label>
                <div className="relative">
                   <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input 
                      type="email" 
                      value={settings.supportEmail}
                      onChange={(e) => handleChange('supportEmail', e.target.value)}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-950 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                   />
                </div>
              </div>
           </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <h3 className="text-xl font-black text-slate-950 mb-10 flex items-center gap-3 relative z-10">
             <Lock className="w-6 h-6 text-rose-500" /> Security Settings
           </h3>
           <div className="space-y-8 relative z-10">
              <ToggleSwitch 
                label="Two-Factor Auth"
                subLabel="Require code for sensitive actions"
                checked={settings.securitySettings?.twoFactorAuth}
                onChange={(val) => handleImmediateUpdate('security', 'twoFactorAuth', val)}
              />
              
              <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Session Timeout (Minutes)</label>
                 <div className="relative">
                   <RefreshCcw className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                   <input 
                     type="number"
                     value={settings.securitySettings?.sessionTimeout}
                     onChange={(e) => handleChange('securitySettings.sessionTimeout', parseInt(e.target.value) || 0)}
                     className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-950 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <h3 className="text-xl font-black text-slate-950 mb-10 flex items-center gap-3 relative z-10">
             <BellRing className="w-6 h-6 text-amber-500" /> Notifications Settings
           </h3>
           <div className="space-y-4 relative z-10">
              <ToggleSwitch 
                label="Global Email Alerts"
                checked={settings.notificationSettings?.emailAlerts}
                onChange={(val) => handleImmediateUpdate('notification', 'emailAlerts', val)}
              />
              <ToggleSwitch 
                label="Browser Push Notifications"
                checked={settings.notificationSettings?.browserAlerts}
                onChange={(val) => handleImmediateUpdate('notification', 'browserAlerts', val)}
              />
           </div>
        </div>

        {/* Payment Configuration */}
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden group lg:col-span-2">
           <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full -mr-24 -mt-24 opacity-50 group-hover:opacity-100 transition-opacity"></div>
           <h3 className="text-xl font-black text-slate-950 mb-10 flex items-center gap-3 relative z-10">
             <CreditCard className="w-6 h-6 text-indigo-500" /> Payment Gateway & Features
           </h3>
           
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10 mb-12">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Primary Gateway</label>
                <select 
                  value={settings.paymentSettings?.gateway}
                  onChange={(e) => handleChange('paymentSettings.gateway', e.target.value)}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-950 focus:ring-4 focus:ring-slate-900/5 outline-none transition-all appearance-none cursor-pointer"
                >
                   <option value="Razorpay">Razorpay (India)</option>
                   <option value="Stripe">Stripe (Global)</option>
                   <option value="PayPal">PayPal</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Razorpay Key ID</label>
                 <div className="relative">
                    <Shield className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                       type="text" 
                       value={settings.paymentSettings?.razorpayKeyId || ''}
                       onChange={(e) => handleChange('paymentSettings.razorpayKeyId', e.target.value)}
                       placeholder="rzp_test_..."
                       className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-950 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                    />
                 </div>
              </div>
              <div className="lg:col-span-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Razorpay Key Secret</label>
                 <div className="relative">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                       type="password" 
                       value={settings.paymentSettings?.razorpayKeySecret || ''}
                       onChange={(e) => handleChange('paymentSettings.razorpayKeySecret', e.target.value)}
                       placeholder="••••••••••••••••"
                       className="w-full pl-16 pr-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-slate-950 focus:ring-4 focus:ring-indigo-600/5 outline-none transition-all"
                    />
                 </div>
              </div>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 p-2">
              <ToggleSwitch 
                label="Is Live Mode"
                subLabel="Use production credentials"
                checked={settings.paymentSettings?.isLiveMode}
                onChange={(val) => handleChange('paymentSettings.isLiveMode', val)}
              />
              <ToggleSwitch 
                label="Enable Payments"
                subLabel="Allow users to initiate checkout"
                checked={settings.paymentSettings?.enablePayments}
                onChange={(val) => handleChange('paymentSettings.enablePayments', val)}
              />
              <ToggleSwitch 
                label="Subscription Plans"
                subLabel="Allow membership billing"
                checked={settings.paymentSettings?.enableSubscriptions}
                onChange={(val) => handleChange('paymentSettings.enableSubscriptions', val)}
              />
              <ToggleSwitch 
                label="Course Payments"
                subLabel="Enable pay-to-learn"
                checked={settings.paymentSettings?.enableCoursePayments}
                onChange={(val) => handleChange('paymentSettings.enableCoursePayments', val)}
              />
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
