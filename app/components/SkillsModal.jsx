// app/components/SkillsModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { FaPlus, FaTimes } from 'react-icons/fa';

const SKILL_OPTIONS = [
  'Leadership',
  'Basic Computer Skill',
  'AI Tools',
  'Social Media Management',
  'Canva Design',
  'Graphic Design',
  'Digital Marketing',
  'MS Office',
  'Communication English',
  'Team Work',
  'Public Speaking',
];

const INTEREST_OPTIONS = [
  'BCS & Govt. Job',
  'Corporate & MNCs',
  'Entrepreneurship',
  'Defence',
  'Teaching & Research',
  'Banking & Finance',
  'Journalism',
];

export const SkillsModal = ({ isOpen, onClose, onSave, skills, interests, customSkills, customInterests }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [customInterest, setCustomInterest] = useState('');
  const [customSkillsList, setCustomSkillsList] = useState([]);
  const [customInterestsList, setCustomInterestsList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedSkills(skills || []);
      setSelectedInterests(interests || []);
      setCustomSkillsList(customSkills || []);
      setCustomInterestsList(customInterests || []);
    }
  }, [isOpen, skills, interests, customSkills, customInterests]);

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !customSkillsList.includes(customSkill.trim())) {
      setCustomSkillsList([...customSkillsList, customSkill.trim()]);
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !customInterestsList.includes(customInterest.trim())) {
      setCustomInterestsList([...customInterestsList, customInterest.trim()]);
      setSelectedInterests([...selectedInterests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  const removeCustomSkill = (skill) => {
    setCustomSkillsList(customSkillsList.filter(s => s !== skill));
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const removeCustomInterest = (interest) => {
    setCustomInterestsList(customInterestsList.filter(i => i !== interest));
    setSelectedInterests(selectedInterests.filter(i => i !== interest));
  };

  const handleSave = () => {
    onSave({
      skills: selectedSkills.filter(s => SKILL_OPTIONS.includes(s)),
      interests: selectedInterests.filter(i => INTEREST_OPTIONS.includes(i)),
      customSkills: customSkillsList,
      customInterests: customInterestsList,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Skills & Interests" size="xl">
      <div className="space-y-6">
        {/* Skills Section */}
        <div>
          <h4 className="font-semibold text-[#3D444C] mb-3">Skills</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SKILL_OPTIONS.map((skill) => (
              <label key={skill} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => toggleSkill(skill)}
                  className="w-4 h-4 text-[#994D35] focus:ring-[#D3A16D]"
                />
                <span className="text-sm text-gray-700">{skill}</span>
              </label>
            ))}
          </div>

          {/* Custom Skills */}
          <div className="mt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="Add custom skill..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
              />
              <button
                onClick={addCustomSkill}
                className="px-4 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors"
              >
                <FaPlus />
              </button>
            </div>
            {customSkillsList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {customSkillsList.map((skill) => (
                  <span key={skill} className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {skill}
                    <button onClick={() => removeCustomSkill(skill)} className="hover:text-red-500">
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Interests Section */}
        <div>
          <h4 className="font-semibold text-[#3D444C] mb-3">Interests</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <label key={interest} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={selectedInterests.includes(interest)}
                  onChange={() => toggleInterest(interest)}
                  className="w-4 h-4 text-[#994D35] focus:ring-[#D3A16D]"
                />
                <span className="text-sm text-gray-700">{interest}</span>
              </label>
            ))}
          </div>

          {/* Custom Interests */}
          <div className="mt-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                placeholder="Add custom interest..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3A16D] focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
              />
              <button
                onClick={addCustomInterest}
                className="px-4 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors"
              >
                <FaPlus />
              </button>
            </div>
            {customInterestsList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {customInterestsList.map((interest) => (
                  <span key={interest} className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {interest}
                    <button onClick={() => removeCustomInterest(interest)} className="hover:text-red-500">
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#994D35] text-white rounded-lg hover:bg-[#D3A16D] transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </Modal>
  );
};