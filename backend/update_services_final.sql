-- Update Services with new content
USE teskilat_db;

-- Clear existing services
TRUNCATE TABLE services;

-- Insert new services based on the updated content
INSERT INTO services (title, description, icon, display_order) VALUES
('Communication Strategy', 'We build clear, future-proof communication strategies that align business goals with brand voice.', 'FaBullhorn', 1),
('Research & Insight', 'We turn data, culture, and human behavior into actionable insights that guide smarter decisions.', 'FaChartLine', 2),
('Brand Development', 'From positioning to tone of voice, we shape brands that are relevant, distinctive, and built to last.', 'FaPalette', 3),
('Digital Marketing', 'We design, build, and manage digital platforms — from websites and apps to performance-driven marketing strategies that deliver measurable growth.', 'FaMobileAlt', 4),
('Social Media', 'We manage social media as a living brand space — strategic, consistent, and culturally aware.', 'FaUsers', 5),
('Integrated Campaigns', 'We design campaigns that move seamlessly across channels, creating one strong, unified story.', 'FaBullhorn', 6),
('Design & Creative', 'We create visual and conceptual systems that elevate brands with clarity and aesthetic intelligence.', 'FaPalette', 7),
('Production', 'From film to photography, we handle production with a focus on quality, efficiency, and craft.', 'FaFilm', 8),
('Media Consultancy', 'We provide strategic guidance to help brands choose the right channels, formats, and moments.', 'FaChartLine', 9),
('Branded Spaces', 'We design physical brand experiences that translate identity into meaningful spatial storytelling.', 'FaPalette', 10),
('Celebrity Management', 'We manage talent partnerships strategically, ensuring authenticity, alignment, and long-term value.', 'FaUsers', 11),
('Influencer Marketing', 'We create influencer collaborations that feel natural, credible, and strategically effective.', 'FaUsers', 12),
('AI Content Production', 'In partnership with MKNDRS, we serve as a next-generation AI Studio, delivering creative ideas and strategy alongside cutting-edge content production.', 'FaRobot', 13);

SELECT 'Services updated successfully!' AS message;
