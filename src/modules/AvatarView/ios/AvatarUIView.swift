import UIKit

/**
 * AvatarUIView — a UIView subclass that renders a circular avatar with initials.
 *
 * Logic is implemented entirely in Swift/UIKit:
 * - Extracts initials from a full name string
 * - Derives a deterministic background color from the name's hash
 * - Displays a centered white UILabel with the initials
 */
@objc final class AvatarUIView: UIView {

    private let initialsLabel: UILabel = {
        let label = UILabel()
        label.textColor = .white
        label.textAlignment = .center
        label.font = UIFont.systemFont(ofSize: 16, weight: .bold)
        label.adjustsFontSizeToFitWidth = true
        label.minimumScaleFactor = 0.5
        label.translatesAutoresizingMaskIntoConstraints = false
        return label
    }()

    // MARK: - Init

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupSubviews()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupSubviews()
    }

    // MARK: - Layout

    override func layoutSubviews() {
        super.layoutSubviews()
        layer.cornerRadius = min(bounds.width, bounds.height) / 2
        layer.masksToBounds = true
        // Font size: ~38% of diameter
        initialsLabel.font = UIFont.systemFont(
            ofSize: min(bounds.width, bounds.height) * 0.38,
            weight: .bold
        )
    }

    // MARK: - Public API

    /// Called by AvatarViewManager when the `name` React prop changes.
    @objc func setName(_ name: String) {
        initialsLabel.text = extractInitials(from: name)
        backgroundColor = color(from: name)
    }

    // MARK: - Private helpers

    private func setupSubviews() {
        clipsToBounds = true
        addSubview(initialsLabel)
        NSLayoutConstraint.activate([
            initialsLabel.centerXAnchor.constraint(equalTo: centerXAnchor),
            initialsLabel.centerYAnchor.constraint(equalTo: centerYAnchor),
            initialsLabel.widthAnchor.constraint(equalTo: widthAnchor, multiplier: 0.8),
            initialsLabel.heightAnchor.constraint(equalTo: heightAnchor, multiplier: 0.8),
        ])
    }

    private func extractInitials(from name: String) -> String {
        let trimmed = name.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return "?" }
        let words = trimmed.components(separatedBy: .whitespaces).filter { !$0.isEmpty }
        if words.count == 1 {
            return String(words[0].prefix(1)).uppercased()
        }
        let first = String(words.first!.prefix(1)).uppercased()
        let last  = String(words.last!.prefix(1)).uppercased()
        return first + last
    }

    private func color(from name: String) -> UIColor {
        var hash: Int = 0
        for scalar in name.unicodeScalars {
            hash = Int(scalar.value) + ((hash << 5) - hash)
        }
        let hue = CGFloat(abs(hash) % 360) / 360.0
        return UIColor(hue: hue, saturation: 0.60, brightness: 0.55, alpha: 1.0)
    }
}
